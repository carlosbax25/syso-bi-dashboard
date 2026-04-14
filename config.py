import os


class Config:
    """Configuración de la aplicación Flask."""
    SECRET_KEY = os.environ.get('SECRET_KEY', 'syso-bi-dashboard-dev-key')
    DEBUG = os.environ.get('FLASK_DEBUG', 'True').lower() in ('true', '1', 'yes')
