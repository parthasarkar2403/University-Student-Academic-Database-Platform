from flask_sqlalchemy import SQLAlchemy

# This "db" object is shared between app.py and models.py
db = SQLAlchemy()


class Student(db.Model):
    """
    One row = one student. This is the first table of the university
    system. Faculty, Courses, Departments, Attendance, Exams, Grades,
    Fees, and Reports will be added one module at a time after this
    works.
    """
    __tablename__ = "students"

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.String(30), unique=True, nullable=False)  # roll/reg number
    full_name = db.Column(db.String(200), nullable=False)
    email = db.Column(db.String(200))
    phone = db.Column(db.String(30))
    department = db.Column(db.String(150))
    year = db.Column(db.String(20))  # e.g. "1st Year", "2nd Year"
    # Active | Graduated | Suspended | Dropped
    status = db.Column(db.String(50), default="Active")
    date_of_birth = db.Column(db.Date)
    enrollment_date = db.Column(db.Date)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(
        db.DateTime, server_default=db.func.now(), onupdate=db.func.now()
    )

    def to_dict(self):
        """Convert this database row into a plain dictionary,
        so Flask can turn it into JSON for the frontend."""
        return {
            "id": self.id,
            "student_id": self.student_id,
            "full_name": self.full_name,
            "email": self.email,
            "phone": self.phone,
            "department": self.department,
            "year": self.year,
            "status": self.status,
            "date_of_birth": self.date_of_birth.isoformat() if self.date_of_birth else None,
            "enrollment_date": self.enrollment_date.isoformat() if self.enrollment_date else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
