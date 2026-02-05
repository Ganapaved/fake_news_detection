"""
Multimodal Fusion Module

This module handles the fusion of verdicts from multiple sources:
- MuRIL text model
- CNN/ViT image model  
- SERP forensic fact-checking

The fusion follows a priority-based approach where forensic fact-checking
has the highest priority and can override local model predictions.
"""

from .verdict_fusion import fuse_verdict, VerdictSource, Verdict
from .forensic_analyzer import analyze_forensic_sources

__all__ = [
    'fuse_verdict',
    'analyze_forensic_sources',
    'VerdictSource',
    'Verdict'
]
