from flask import Blueprint, render_template

presentacion_bp = Blueprint('presentacion', __name__)


@presentacion_bp.route('/presentacion')
def presentacion():
    """Renderiza la presentación interactiva de sustentación (pública, sin login)."""
    return render_template('presentacion.html')
