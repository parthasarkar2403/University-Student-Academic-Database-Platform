from datetime import datetime

from flask import Flask, request, jsonify
from flask_cors import CORS

from config import Config
from models import db, Student


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Render sometimes gives a URL that starts with "postgres://"
    # but SQLAlchemy needs "postgresql://". This line fixes that automatically.
    uri = app.config["SQLALCHEMY_DATABASE_URI"]
    if uri.startswith("postgres://"):
        app.config["SQLALCHEMY_DATABASE_URI"] = uri.replace(
            "postgres://", "postgresql://", 1
        )

    # Allow the React frontend (running on a different address) to call this API
    CORS(app)

    db.init_app(app)

    # Create the "students" table automatically if it doesn't exist yet
    with app.app_context():
        db.create_all()

    # ---------------------------------------------------------------
    # Basic routes to check the server is alive
    # ---------------------------------------------------------------
    @app.route("/")
    def home():
        return {"message": "University System API is running"}

    @app.route("/api/health")
    def health():
        return {"status": "ok"}

    # ---------------------------------------------------------------
    # STUDENTS - CRUD API
    # CRUD = Create, Read, Update, Delete
    # ---------------------------------------------------------------

    # READ (all students, with optional search & filters)
    # Example: GET /api/students?search=john&department=Computer Science&status=Active
    @app.route("/api/students", methods=["GET"])
    def get_students():
        search = request.args.get("search", "").strip()
        department = request.args.get("department", "").strip()
        status = request.args.get("status", "").strip()

        query = Student.query
        if search:
            query = query.filter(
                db.or_(
                    Student.full_name.ilike(f"%{search}%"),
                    Student.student_id.ilike(f"%{search}%"),
                    Student.email.ilike(f"%{search}%"),
                )
            )
        if department:
            query = query.filter(Student.department == department)
        if status:
            query = query.filter(Student.status == status)

        students = query.order_by(Student.created_at.desc()).all()
        return jsonify([s.to_dict() for s in students])

    # READ (a single student by id)
    @app.route("/api/students/<int:student_id>", methods=["GET"])
    def get_student(student_id):
        student = Student.query.get(student_id)
        if not student:
            return jsonify({"error": "Student not found"}), 404
        return jsonify(student.to_dict())

    # CREATE (add a new student)
    @app.route("/api/students", methods=["POST"])
    def create_student():
        data = request.get_json() or {}
        full_name = (data.get("full_name") or "").strip()
        student_id_value = (data.get("student_id") or "").strip()

        if not full_name:
            return jsonify({"error": "Student full name is required"}), 400
        if not student_id_value:
            return jsonify({"error": "Student ID is required"}), 400

        if Student.query.filter_by(student_id=student_id_value).first():
            return jsonify({"error": f"Student ID '{student_id_value}' already exists"}), 400

        student = Student(
            student_id=student_id_value,
            full_name=full_name,
            email=data.get("email"),
            phone=data.get("phone"),
            department=data.get("department"),
            year=data.get("year"),
            status=data.get("status", "Active"),
            date_of_birth=parse_date(data.get("date_of_birth")),
            enrollment_date=parse_date(data.get("enrollment_date")),
        )
        db.session.add(student)
        db.session.commit()
        return jsonify(student.to_dict()), 201

    # UPDATE (edit an existing student)
    @app.route("/api/students/<int:student_id>", methods=["PUT"])
    def update_student(student_id):
        student = Student.query.get(student_id)
        if not student:
            return jsonify({"error": "Student not found"}), 404

        data = request.get_json() or {}

        if "full_name" in data:
            if not data["full_name"].strip():
                return jsonify({"error": "Full name cannot be empty"}), 400
            student.full_name = data["full_name"].strip()

        if "student_id" in data:
            new_sid = data["student_id"].strip()
            if not new_sid:
                return jsonify({"error": "Student ID cannot be empty"}), 400
            existing = Student.query.filter_by(student_id=new_sid).first()
            if existing and existing.id != student.id:
                return jsonify({"error": f"Student ID '{new_sid}' already exists"}), 400
            student.student_id = new_sid

        for field in ["email", "phone", "department", "year", "status"]:
            if field in data:
                setattr(student, field, data[field])

        if "date_of_birth" in data:
            student.date_of_birth = parse_date(data["date_of_birth"])
        if "enrollment_date" in data:
            student.enrollment_date = parse_date(data["enrollment_date"])

        db.session.commit()
        return jsonify(student.to_dict())

    # DELETE (remove a student)
    @app.route("/api/students/<int:student_id>", methods=["DELETE"])
    def delete_student(student_id):
        student = Student.query.get(student_id)
        if not student:
            return jsonify({"error": "Student not found"}), 404

        db.session.delete(student)
        db.session.commit()
        return jsonify({"message": "Student deleted successfully"})

    return app


def parse_date(value):
    """Turns a 'YYYY-MM-DD' string from the frontend into a real date."""
    if not value:
        return None
    try:
        return datetime.strptime(value, "%Y-%m-%d").date()
    except (ValueError, TypeError):
        return None


app = create_app()

if __name__ == "__main__":
    app.run(debug=True, port=5000)
