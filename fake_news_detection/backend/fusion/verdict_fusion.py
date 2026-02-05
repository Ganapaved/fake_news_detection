"""
Verdict Fusion Module

Implements multimodal fusion logic for combining verdicts from:
- MuRIL text model
- CNN/ViT image model
- SERP forensic fact-checking

Fusion follows priority-based rules with forensic override.
"""

from enum import Enum
from typing import Dict, Optional, List


class VerdictSource(Enum):
    """Source of the verdict"""
    MURIL = "muril_model"
    IMAGE = "image_model"
    FORENSIC = "forensic_check"
    FUSED = "multimodal_fusion"


class Verdict:
    """Structured verdict object"""
    def __init__(self, label: str, confidence: float, source: VerdictSource):
        self.label = label  # 'FAKE' or 'REAL'
        self.confidence = confidence  # 0.0 to 1.0
        self.source = source
        self.reasoning = []


def fuse_verdict(
    muril_verdict: Dict,
    image_verdict: Dict,
    forensic_verdict: Optional[Dict],
    fusion_strategy: str = "forensic_override"
) -> Dict:
    """
    Fuse multimodal verdicts with forensic override capability.
    
    Fusion Rules (Priority Order):
    1. FORENSIC OVERRIDE (Highest Priority)
       - If forensic check is confident (>0.7), use it
       - Override local models even if they disagree
    
    2. MULTIMODAL CONSENSUS
       - If text + image agree, use consensus
       - Average their confidences
    
    3. DISAGREEMENT RESOLUTION
       - Use verdict with higher confidence
       - Fallback to MuRIL if equal
    
    Args:
        muril_verdict: {'label': 'FAKE'/'REAL', 'confidence': float}
        image_verdict: {'label': 'FAKE'/'REAL', 'confidence': float}
        forensic_verdict: {'label': 'FAKE'/'REAL'/'UNCERTAIN', 'confidence': float, 'sources': list}
                         Can be None if forensic check failed
        fusion_strategy: 'forensic_override' | 'weighted_average' | 'majority_vote'
    
    Returns:
        {
            'final_label': str,
            'final_confidence': float,
            'fusion_source': str,
            'component_verdicts': dict,
            'reasoning': list,
            'override_applied': bool
        }
    """
    
    reasoning = []
    override_applied = False
    
    # RULE 1: Forensic Override (Highest Priority)
    if forensic_verdict and forensic_verdict.get('label') != 'UNCERTAIN':
        forensic_confidence = forensic_verdict.get('confidence', 0.0)
        forensic_label = forensic_verdict['label']
        
        # Only apply forensic override if confidence is high enough
        if forensic_confidence > 0.7:
            num_sources = len(forensic_verdict.get('sources', []))
            credible_count = forensic_verdict.get('credible_source_count', 0)
            
            reasoning.append(
                f"Forensic fact-check: {forensic_label} "
                f"(confidence: {forensic_confidence:.2f}, "
                f"sources: {num_sources}, credible: {credible_count})"
            )
            
            # Check if override is needed
            if forensic_label != muril_verdict['label']:
                override_applied = True
                reasoning.append(
                    f"⚠️ FORENSIC OVERRIDE: Forensic verdict '{forensic_label}' "
                    f"overrides local model '{muril_verdict['label']}'"
                )
            else:
                reasoning.append(
                    f"✓ Forensic check confirms local model prediction"
                )
            
            return {
                'final_label': forensic_label,
                'final_confidence': forensic_confidence,
                'fusion_source': VerdictSource.FORENSIC.value,
                'component_verdicts': {
                    'muril': muril_verdict,
                    'image': image_verdict,
                    'forensic': forensic_verdict
                },
                'reasoning': reasoning,
                'override_applied': override_applied
            }
        else:
            reasoning.append(
                f"Forensic check available but low confidence ({forensic_confidence:.2f}), "
                f"using local models"
            )
    else:
        if forensic_verdict:
            reasoning.append(
                f"Forensic check inconclusive (UNCERTAIN), using local models"
            )
        else:
            reasoning.append(
                f"Forensic check unavailable, using local models only"
            )
    
    # RULE 2: Multimodal Consensus (Text + Image agree)
    if muril_verdict['label'] == image_verdict['label']:
        # Models agree - average their confidences
        avg_confidence = (muril_verdict['confidence'] + image_verdict['confidence']) / 2
        
        reasoning.append(
            f"Text and Image models agree on '{muril_verdict['label']}' "
            f"(avg confidence: {avg_confidence:.2f})"
        )
        
        # Boost confidence slightly for consensus
        boosted_confidence = min(avg_confidence * 1.1, 0.95)
        
        return {
            'final_label': muril_verdict['label'],
            'final_confidence': boosted_confidence,
            'fusion_source': VerdictSource.FUSED.value,
            'component_verdicts': {
                'muril': muril_verdict,
                'image': image_verdict,
                'forensic': forensic_verdict
            },
            'reasoning': reasoning,
            'override_applied': False
        }
    
    # RULE 3: Disagreement - Use higher confidence
    if muril_verdict['confidence'] > image_verdict['confidence']:
        reasoning.append(
            f"Models disagree. Using MuRIL verdict '{muril_verdict['label']}' "
            f"(confidence: {muril_verdict['confidence']:.2f} > "
            f"{image_verdict['confidence']:.2f})"
        )
        final_verdict = muril_verdict
        source = VerdictSource.MURIL
    else:
        reasoning.append(
            f"Models disagree. Using Image verdict '{image_verdict['label']}' "
            f"(confidence: {image_verdict['confidence']:.2f} >= "
            f"{muril_verdict['confidence']:.2f})"
        )
        final_verdict = image_verdict
        source = VerdictSource.IMAGE
    
    # Reduce confidence slightly for disagreement
    reduced_confidence = final_verdict['confidence'] * 0.9
    
    return {
        'final_label': final_verdict['label'],
        'final_confidence': reduced_confidence,
        'fusion_source': source.value,
        'component_verdicts': {
            'muril': muril_verdict,
            'image': image_verdict,
            'forensic': forensic_verdict
        },
        'reasoning': reasoning,
        'override_applied': False
    }


def get_fusion_summary(fused_result: Dict) -> str:
    """
    Generate human-readable summary of fusion result.
    
    Args:
        fused_result: Output from fuse_verdict()
    
    Returns:
        Human-readable summary string
    """
    label = fused_result['final_label']
    confidence = fused_result['final_confidence']
    source = fused_result['fusion_source']
    override = fused_result['override_applied']
    
    summary = f"Final Verdict: {label} (confidence: {confidence:.1%})"
    summary += f"\nSource: {source}"
    
    if override:
        summary += "\n⚠️ Forensic override applied"
    
    return summary
