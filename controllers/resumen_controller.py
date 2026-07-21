from flask import Blueprint, render_template, session, redirect, url_for

resumen_bp = Blueprint('resumen', __name__)


@resumen_bp.route('/resumen')
def resumen_ejecutivo():
    if not session.get('user'):
        return redirect(url_for('auth.login'))
    return render_template('resumen.html')
