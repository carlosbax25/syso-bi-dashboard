from flask import Blueprint, render_template, request, redirect, url_for, session

auth_bp = Blueprint('auth', __name__)

USERS = {
    'Admin': '123',
}


@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username', '')
        password = request.form.get('password', '')
        if USERS.get(username) == password:
            session['user'] = username
            return redirect(url_for('dashboard.dashboard'))
        return render_template('login.html', error=True)
    # Siempre mostrar login (limpiar sesión previa)
    session.pop('user', None)
    return render_template('login.html', error=False)


@auth_bp.route('/logout', methods=['POST'])
def logout():
    session.pop('user', None)
    return redirect(url_for('auth.login'))
