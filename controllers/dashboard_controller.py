from flask import Blueprint, render_template, session, redirect, url_for

dashboard_bp = Blueprint('dashboard', __name__)


@dashboard_bp.route('/')
def index():
    """Renderiza la página principal del dashboard."""
    if not session.get('user'):
        return redirect(url_for('auth.login'))
    return render_template('dashboard.html')
