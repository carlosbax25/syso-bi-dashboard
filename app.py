from flask import Flask, jsonify

from config import Config
from controllers.dashboard_controller import dashboard_bp
from controllers.api_controller import api_bp, init_api
from controllers.auth_controller import auth_bp
from controllers.gestion_controller import gestion_bp
from repositories.fake_data_repository import FakeDataRepository
from services.dashboard_service import DashboardService


def create_app(config=None) -> Flask:
    """Factory de la aplicación Flask con inyección de dependencias."""
    app = Flask(__name__)
    app.config.from_object(config or Config)

    # Inyección de dependencias
    repo = FakeDataRepository(seed=42, num_registros=26354)
    service = DashboardService(repo)

    # Registrar blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(gestion_bp)
    init_api(service)
    app.register_blueprint(api_bp)

    # Manejadores de error
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({"error": "Recurso no encontrado"}), 404

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({"error": "Error interno del servidor"}), 500

    return app


if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)
