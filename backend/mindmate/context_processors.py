from .firebase_config import firebase_config

def firebase_context(request):
    """
    Context processor to make Firebase configuration available to all templates
    """
    return {
        'firebase_config': firebase_config
    }