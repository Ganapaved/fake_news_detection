"""
Forensic Analyzer Module

Analyzes SERP (Search Engine Results Page) data to determine
the forensic verdict based on fact-checking sources and indicators.
"""

from typing import Dict, List, Optional
import re


def analyze_forensic_sources(web_sources: List[Dict]) -> Dict:
    """
    Analyze SERP results to determine forensic verdict.
    
    This function examines web search results to identify:
    1. Credible fact-checking sources
    2. Fake news indicators in snippets
    3. Real news indicators in snippets
    
    Args:
        web_sources: List of search results from SERP API
                    [{'title': str, 'snippet': str, 'link': str}, ...]
    
    Returns:
        {
            'label': 'FAKE' | 'REAL' | 'UNCERTAIN',
            'confidence': float (0.0 to 1.0),
            'sources': list (original web sources),
            'credibility_score': float (0.0 to 1.0),
            'fake_signals': int,
            'real_signals': int,
            'credible_source_count': int
        }
    """
    
    # Handle empty or invalid sources
    if not web_sources or not web_sources[0].get('title'):
        return {
            'label': 'UNCERTAIN',
            'confidence': 0.0,
            'sources': [],
            'credibility_score': 0.0,
            'fake_signals': 0,
            'real_signals': 0,
            'credible_source_count': 0
        }
    
    # Credible fact-checking domains (international + Indian)
    FACT_CHECKERS = [
        # International
        'factcheck.org', 'snopes.com', 'politifact.com',
        'apnews.com', 'reuters.com', 'bbc.com', 'bbc.co.uk',
        'fullfact.org', 'factcheck.afp.com',
        
        # Indian fact-checkers
        'altnews.in', 'boomlive.in', 'thequint.com',
        'factchecker.in', 'newsmobile.in', 'indiatoday.in/fact-check',
        'thelogicalindian.com', 'vishvasnews.com'
    ]
    
    # Fake news indicators (keywords that suggest content is fake)
    FAKE_INDICATORS = [
        'false', 'fake', 'misleading', 'debunked', 'hoax',
        'unverified', 'fabricated', 'doctored', 'manipulated',
        'misinformation', 'disinformation', 'untrue', 'incorrect',
        'baseless', 'unfounded', 'rumor', 'rumour', 'myth',
        'photoshopped', 'edited', 'altered', 'morphed'
    ]
    
    # Real news indicators (keywords that suggest content is authentic)
    REAL_INDICATORS = [
        'confirmed', 'verified', 'true', 'authentic',
        'official', 'legitimate', 'accurate', 'factual',
        'validated', 'genuine', 'actual', 'real',
        'substantiated', 'corroborated'
    ]
    
    credible_sources = []
    fake_signals = 0
    real_signals = 0
    
    # Analyze each source
    for source in web_sources[:5]:  # Analyze top 5 sources
        link = source.get('link', '').lower()
        snippet = source.get('snippet', '').lower()
        title = source.get('title', '').lower()
        
        # Check if from credible fact-checker
        is_credible = any(fc in link for fc in FACT_CHECKERS)
        
        # Count fake/real indicators in text
        fake_count = sum(1 for ind in FAKE_INDICATORS if ind in snippet or ind in title)
        real_count = sum(1 for ind in REAL_INDICATORS if ind in snippet or ind in title)
        
        if is_credible:
            credible_sources.append(source)
            # Weight credible sources more heavily (2x)
            fake_signals += fake_count * 2
            real_signals += real_count * 2
        else:
            fake_signals += fake_count
            real_signals += real_count
    
    # Determine verdict based on signal analysis
    total_signals = fake_signals + real_signals
    
    if total_signals == 0:
        # No clear signals found
        return {
            'label': 'UNCERTAIN',
            'confidence': 0.0,
            'sources': web_sources,
            'credibility_score': 0.0,
            'fake_signals': 0,
            'real_signals': 0,
            'credible_source_count': 0
        }
    
    # Calculate fake ratio
    fake_ratio = fake_signals / total_signals
    
    # Determine label and confidence
    if fake_ratio > 0.6:
        # Strong fake signals
        label = 'FAKE'
        confidence = min(fake_ratio, 0.95)  # Cap at 95%
    elif fake_ratio < 0.4:
        # Strong real signals
        label = 'REAL'
        confidence = min(1 - fake_ratio, 0.95)  # Cap at 95%
    else:
        # Ambiguous signals
        label = 'UNCERTAIN'
        confidence = 0.5
    
    # Calculate credibility score (proportion of credible sources)
    credibility_score = len(credible_sources) / max(len(web_sources), 1)
    
    # Boost confidence if credible sources are present
    if credibility_score > 0.5 and label != 'UNCERTAIN':
        confidence = min(confidence * 1.2, 0.95)
    
    return {
        'label': label,
        'confidence': confidence,
        'sources': web_sources,
        'credibility_score': credibility_score,
        'fake_signals': fake_signals,
        'real_signals': real_signals,
        'credible_source_count': len(credible_sources)
    }


def get_forensic_summary(forensic_result: Dict) -> str:
    """
    Generate human-readable summary of forensic analysis.
    
    Args:
        forensic_result: Output from analyze_forensic_sources()
    
    Returns:
        Human-readable summary string
    """
    label = forensic_result['label']
    confidence = forensic_result['confidence']
    credible_count = forensic_result.get('credible_source_count', 0)
    
    if label == 'UNCERTAIN':
        return "Forensic analysis inconclusive - insufficient fact-checking data"
    
    summary = f"Forensic verdict: {label} (confidence: {confidence:.1%})"
    
    if credible_count > 0:
        summary += f" - {credible_count} credible fact-checking source(s) found"
    
    return summary
