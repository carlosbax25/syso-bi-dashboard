from flask import Blueprint, render_template, session, redirect, url_for

gestion_bp = Blueprint('gestion', __name__)


@gestion_bp.route('/gestion')
def gestion_panel():
    if not session.get('user'):
        return redirect(url_for('auth.login'))
    return render_template('gestion.html')
