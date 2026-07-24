from flask import Blueprint, render_template, session, redirect, url_for, request, jsonify, current_app, send_from_directory

gestion_bp = Blueprint('gestion', __name__)


@gestion_bp.route('/gestion')
def gestion_panel():
    if not session.get('user'):
        return redirect(url_for('auth.login'))
    return render_template('gestion.html')


@gestion_bp.route('/gestion/descargar-formato')
def descargar_formato():
    """Fuerza la descarga del formato Excel."""
    return send_from_directory(
        'static',
        'Formato_Carga_Ordenes.xlsx',
        as_attachment=True,
        download_name='Formato_Carga_Ordenes.xlsx'
    )


@gestion_bp.route('/gestion/upload', methods=['POST'])
def upload_excel():
    """Recibe un archivo Excel con órdenes y lo procesa.

    Columnas esperadas (la fila 1 es encabezado):
    0: ID
    1: Fecha (YYYY-MM-DD)
    2: ARL
    3: Empresa
    4: Tipo Servicio
    5: Programa
    6: Tarea
    7: Trabajadores
    8: Estado
    9: Valor Facturado
    10: Responsable          (opcional)
    11: Fecha Ejecución      (opcional, YYYY-MM-DD)
    12: Fecha Facturación    (opcional, YYYY-MM-DD)
    """
    if not session.get('user'):
        return jsonify({'error': 'No autorizado'}), 401

    if 'file' not in request.files:
        return jsonify({'error': 'No se envió ningún archivo'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'Nombre de archivo vacío'}), 400

    if not file.filename.endswith('.xlsx'):
        return jsonify({'error': 'Solo se aceptan archivos .xlsx'}), 400

    try:
        import openpyxl
        from datetime import date
        from models.orden import Orden

        wb = openpyxl.load_workbook(file, data_only=True)
        ws = wb.active

        ordenes = []
        errors = []

        def _parse_date_cell(val):
            """Parsea fechas desde celda Excel (str, date, datetime o None)."""
            if val is None:
                return None
            # openpyxl puede entregar datetime directamente
            if hasattr(val, 'date'):
                return val.date()
            s = str(val).strip()
            if not s or s.lower() in ('none', 'null', ''):
                return None
            try:
                return date.fromisoformat(s[:10])
            except ValueError:
                return None

        for i, row in enumerate(ws.iter_rows(min_row=2, values_only=True), 2):
            if not row or not any(row):
                continue
            try:
                cells = list(row)
                # Pad to at least 13 columns
                while len(cells) < 13:
                    cells.append(None)

                orden_id = int(cells[0]) if cells[0] else i - 1
                fecha = _parse_date_cell(cells[1]) or date.today()

                orden = Orden(
                    id=orden_id,
                    fecha=fecha,
                    arl=str(cells[2] or '').strip(),
                    empresa=str(cells[3] or '').strip(),
                    tipo_servicio=str(cells[4] or '').strip(),
                    programa=str(cells[5] or '').strip(),
                    tarea=str(cells[6] or '').strip(),
                    cantidad_trabajadores=int(cells[7]) if cells[7] else 1,
                    estado=str(cells[8] or '').strip(),
                    valor_facturado=float(cells[9]) if cells[9] else 0.0,
                    responsable=str(cells[10] or '').strip(),
                    fecha_ejecucion=_parse_date_cell(cells[11]),
                    fecha_facturacion=_parse_date_cell(cells[12]),
                )
                ordenes.append(orden)
            except Exception as e:
                errors.append(f'Fila {i}: {str(e)}')

        if not ordenes:
            return jsonify({'error': 'No se encontraron órdenes válidas en el archivo', 'details': errors}), 400

        # Agregar nuevas órdenes al repositorio (sin borrar las existentes)
        service = current_app.config.get('DASHBOARD_SERVICE')
        if service:
            service._repo._ordenes.extend(ordenes)

        return jsonify({
            'success': True,
            'message': f'Se cargaron {len(ordenes)} órdenes exitosamente',
            'total': len(ordenes),
            'errors': errors[:10] if errors else [],
        })

    except Exception as e:
        return jsonify({'error': f'Error procesando archivo: {str(e)}'}), 500
