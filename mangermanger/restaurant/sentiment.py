_pipeline = None

# nlptown/bert-base-multilingual-uncased-sentiment
# Modèle multilingue (français inclus) retournant 1-5 étoiles.
# 1-2 étoiles → négatif  |  3 étoiles → neutre  |  4-5 étoiles → positif
def _stars_to_label(label_str):
    stars = int(label_str.split()[0])
    if stars <= 2:
        return 'negatif'
    if stars == 3:
        return 'neutre'
    return 'positif'


def _get_pipeline():
    global _pipeline
    if _pipeline is None:
        from transformers import pipeline as hf_pipeline
        _pipeline = hf_pipeline(
            "sentiment-analysis",
            model="nlptown/bert-base-multilingual-uncased-sentiment",
        )
    return _pipeline


def analyser_sentiment(texte):
    """Retourne (label, score) pour un texte donné.
    label : 'positif' | 'neutre' | 'negatif'
    score : float 0-1 (confiance du modèle)
    """
    if not texte or not texte.strip():
        return 'neutre', 0.5
    try:
        pipe = _get_pipeline()
        result = pipe(texte[:512])[0]
        label = _stars_to_label(result['label'])
        return label, round(float(result['score']), 4)
    except Exception:
        return 'neutre', 0.5


def analyser_sentiment_avec_etoiles(texte):
    """Retourne (label, score, note) — note est 1-5 attribué par BERT.
    C'est BERT qui décide de la note, pas le client.
    """
    if not texte or not texte.strip():
        return 'neutre', 0.5, 3
    try:
        pipe = _get_pipeline()
        result = pipe(texte[:512])[0]
        note = int(result['label'].split()[0])
        label = _stars_to_label(result['label'])
        return label, round(float(result['score']), 4), note
    except Exception:
        return 'neutre', 0.5, 3
