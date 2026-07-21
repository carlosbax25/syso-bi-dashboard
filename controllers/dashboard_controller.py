from flask import Blueprint, render_template, session, redirect, url_for

dashboard_bp = Blueprint('dashboard', __name__)


@dashboard_bp.route('/')
def index():
    """Redirige a la presentación como página principal."""
    return redirect(url_for('presentacion.presentacion'))


@dashboard_bp.route('/dashboard')
def dashboard():
    """Renderiza la página del dashboard BI (requiere login)."""
    if not session.get('user'):
        return redirect(url_for('auth.login'))
    return render_template('dashboard.html')
