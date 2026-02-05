# model.py

import math
import torch
import torch.nn as nn

from transformers import AutoModel
from torchvision.models import vit_b_16
import numpy as np
import cv2


class CrossAttention(nn.Module):
    def __init__(self, tdim, idim, fdim):
        super().__init__()

        self.query = nn.Linear(tdim, fdim)
        self.key   = nn.Linear(idim, fdim)
        self.value = nn.Linear(idim, fdim)

        self.scale = math.sqrt(fdim)

    def forward(self, t, i):
        """
        t : (B, 768)  → text CLS embedding
        i : (B, 768)  → image embedding
        """

        # Convert to 3D for attention
        t = t.unsqueeze(1)    # (B,1,768)
        i = i.unsqueeze(1)    # (B,1,768)

        Q = self.query(t)     # (B,1,512)
        K = self.key(i)       # (B,1,512)
        V = self.value(i)     # (B,1,512)

        scores = torch.matmul(Q, K.transpose(1, 2)) / self.scale
        attn = torch.softmax(scores, dim=-1)

        out = torch.matmul(attn, V).squeeze(1)  # (B,512)

        # Concatenate text + attended image
        return torch.cat([t.squeeze(1), out], dim=-1)


class FakeNewsModel(nn.Module):
    def __init__(self, num_claims, TEXT_MODEL_NAME="google/muril-base-cased"):
        super().__init__()

        # ---- TEXT ENCODER ----
        self.text_model = AutoModel.from_pretrained(TEXT_MODEL_NAME)

        # ---- IMAGE ENCODER ----
        self.image_model = vit_b_16(weights="DEFAULT")
        self.image_model.heads = nn.Identity()   # Remove ViT classifier

        # ---- FUSION ----
        self.cross = CrossAttention(768, 768, 512)

        FUSED_DIM = 768 + 512

        # ---- FAKE / REAL HEAD ----
        self.fake_head = nn.Sequential(
            nn.Linear(FUSED_DIM, 256),
            nn.ReLU(),
            nn.Linear(256, 1),
            nn.Sigmoid()
        )

        # ---- CLAIM TYPE HEAD ----
        self.claim_head = nn.Sequential(
            nn.Linear(FUSED_DIM, 256),
            nn.ReLU(),
            nn.Linear(256, num_claims)
        )

    def forward(self, ids, mask, img):
        # Text CLS embedding
        txt = self.text_model(
            ids,
            attention_mask=mask
        ).last_hidden_state[:, 0, :]

        # Image embedding
        img = self.image_model(img)  # (B,768)

        # Cross-attention fusion
        fused = self.cross(txt, img)

        fake_out  = self.fake_head(fused)
        claim_out = self.claim_head(fused)

        return fake_out, claim_out
    
class GradCAMViT:
    """
    Grad-CAM for Vision Transformer - Uses input gradients
    Works universally with any ViT architecture
    """
    def __init__(self, model):
        self.model = model
        self.device = next(model.parameters()).device
        
    def generate_cam(self, img_tensor):
        """
        Generate Class Activation Map using input gradients
        """
        self.model.eval()
        
        # Clone and enable gradient tracking
        img_tensor = img_tensor.clone().detach().to(self.device)
        img_tensor.requires_grad = True
        
        # Forward pass
        output = self.model(img_tensor)
        
        # Handle different output formats
        if hasattr(output, 'last_hidden_state'):
            features = output.last_hidden_state[:, 0, :]  # CLS token
        elif isinstance(output, tuple):
            features = output[0] if len(output) > 0 else output
        else:
            features = output
        
        # Flatten if needed
        if features.dim() > 2:
            features = features.reshape(features.size(0), -1)
        
        # Backward pass
        self.model.zero_grad()
        if img_tensor.grad is not None:
            img_tensor.grad.zero_()
        
        # Target: sum of all features
        target = features.sum()
        target.backward()
        
        # Get gradients w.r.t input
        gradients = img_tensor.grad.data
        
        # Generate CAM
        cam = gradients.squeeze(0).cpu().numpy()  # (3, 224, 224)
        cam = np.abs(cam).mean(axis=0)  # Average RGB, take absolute
        
        # Normalize to [0, 1]
        cam = cam - cam.min()
        if cam.max() > 0:
            cam = cam / cam.max()
        
        return cam

    
class VITAttentionrollout:
    def __init__(self, model):
        self.model = model
        self.attention_maps = []
        self.hooks = []
        
    def clear_hooks(self):
        for hook in self.hooks:
            hook.remove()
        self.hooks = []
        self.attention_maps = []
    
    def get_attention_hook(self, module, input, output):
        """
        Hook for PyTorch MultiheadAttention
        Output format: (attn_output, attn_weights)
        """
        if isinstance(output, tuple) and len(output) > 1:
            # attn_weights shape: (B, num_heads, T, T) or (B, T, T)
            attn_weights = output[1]
            if attn_weights is not None:
                self.attention_maps.append(attn_weights.detach())
    
    def rollout(self, img_tensor, start_layer=0):
        """
        Perform attention rollout across all layers
        """
        self.attention_maps = []
        self.model.eval()
        
        # Register hooks on all self_attention modules
        for name, module in self.model.named_modules():
            if 'self_attention' in name:
                hook = module.register_forward_hook(self.get_attention_hook)
                self.hooks.append(hook)
        
        # Forward pass with attention output
        with torch.no_grad():
            _ = self.model(img_tensor)
        
        # Clean up hooks
        self.clear_hooks()
        
        if len(self.attention_maps) == 0:
            raise ValueError("No attention maps captured. Check if model returns attention weights.")
        
        print(f"Captured {len(self.attention_maps)} attention layers")
        
        # Process attention maps
        processed_attns = []
        for attn in self.attention_maps:
            # Handle different attention formats
            if attn.dim() == 4:
                # (B, num_heads, T, T) -> (B, T, T)
                attn = attn.mean(dim=1)
            elif attn.dim() == 3:
                # (B, T, T) already correct
                pass
            else:
                continue
            
            processed_attns.append(attn)
        
        if len(processed_attns) == 0:
            raise ValueError("Could not process attention maps")
        
        # Stack: (num_layers, B, T, T)
        result = torch.stack(processed_attns)
        
        # Add identity (residual connections)
        num_tokens = result.shape[-1]
        batch_size = result.shape[1]
        eye = torch.eye(num_tokens).expand(batch_size, num_tokens, num_tokens).to(result.device)
        
        # Normalize with residual
        result = result + eye.unsqueeze(0)
        result = result / result.sum(dim=-1, keepdim=True)
        
        # Multiply attention matrices (rollout)
        joint_attention = result[start_layer]
        for i in range(start_layer + 1, result.shape[0]):
            joint_attention = torch.matmul(result[i], joint_attention)
        
        # Extract CLS token attention to patches
        # Assuming token 0 is CLS, tokens 1+ are patches
        mask = joint_attention[0, 0, 1:]  # (num_patches,)
        
        # Reshape to 2D grid
        grid_size = int(mask.shape[0] ** 0.5)
        mask = mask.reshape(grid_size, grid_size)
        
        return mask.cpu().numpy()