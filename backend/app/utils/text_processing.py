"""
Text Preprocessing and Keyword Extraction Utilities.
Provides deterministic text cleaning used identically during training and inference.
"""

import re
import string
from typing import List


def clean_text(text: str) -> str:
    """
    Standardize text for ML processing:
    1. Lowercase text
    2. Normalize URLs, phone numbers, currency symbols to semantic tokens
    3. Normalize multiple whitespace and strip
    """
    if not isinstance(text, str):
        return ""

    text = text.lower()

    # Normalize URLs
    text = re.sub(r"https?://\S+|www\.\S+", " url_link ", text)

    # Normalize email addresses
    text = re.sub(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b", " email_addr ", text)

    # Normalize currency amounts (e.g., $100, £50, 100$)
    text = re.sub(r"[\$£€¥]\s*\d+(?:[.,]\d+)?|\d+\s*[\$£€¥]", " currency_amount ", text)

    # Normalize phone numbers or shortcodes (7-15 digits)
    text = re.sub(r"\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b|\b\d{5,6}\b", " phone_num ", text)

    # Normalize excessive punctuation (e.g., !!! -> !)
    text = re.sub(r"([!?.,])\1+", r" \1 ", text)

    # Remove non-ascii characters or control characters
    text = re.sub(r"[^\x00-\x7F]+", " ", text)

    # Normalize whitespace
    text = re.sub(r"\s+", " ", text).strip()

    return text


def extract_key_indicators(text: str) -> List[str]:
    """
    Identifies notable spam-associated patterns or words in the text for UI explanation.
    """
    lower = text.lower()
    spam_patterns = [
        "free", "won", "winner", "prize", "claim", "urgent", "cash",
        "jackpot", "lottery", "call now", "text to", "click here", "gift card",
        "pre-approved", "credit card", "suspicious activity", "customs fee",
        "refund", "bitcoin", "guaranteed", "expire", "action required"
    ]

    matched = []
    for pattern in spam_patterns:
        if pattern in lower:
            matched.append(pattern)

    return matched[:6]
