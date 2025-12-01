import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Course } from '../lib/supabase';
import CoursePlayerModal from '../components/CoursePlayerModal';

export default function CursosPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    const { data } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setCourses(data);
    }
    setLoading(false);
  };

  const getMembershipText = () => {
    if (user?.membership_type === 'black_elite') {
      return 'Black Elite';
    }
    if (user?.membership_type === 'platinum') {
      return 'Platinum';
    }
    return 'Gold';
  };

  const getAccessText = (course: Course) => {
    if (user?.membership_type === 'black_elite' && course.black_elite_free) {
      return 'Acceso Desbloqueado';
    }
    if (user?.membership_type === 'platinum') {
      return `${course.platinum_discount}% OFF`;
    }
    return `${course.gold_discount}% OFF`;
  };

  return (
    <div className="flex-1 overflow-y-auto pb-24">
      <header className="sticky top-0 z-50 bg-black/60 backdrop-blur-xl border-b border-white/5 px-6 py-5 transition-all duration-300">
        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-gold-400 to-gold-300 text-center tracking-[0.15em] uppercase">Educación y Mentoría</h1>
      </header>

      <main className="p-6 space-y-8">
        <p className="text-white/60 text-center font-medium leading-relaxed tracking-wide">
          Como miembro{' '}
          <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-gold-200 via-gold-400 to-gold-200">
            {getMembershipText()}
          </span>
          , tiene acceso a beneficios exclusivos en todos los cursos.
        </p>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-12 h-12 rounded-full border-2 border-gold-400/30 border-t-gold-400 animate-spin" />
            <p className="text-white/40 font-light tracking-wide text-sm">Cargando cursos...</p>
          </div>
        ) : (
          courses.map((course) => (
            <div
              key={course.id}
              className="group relative rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-gold-900/20"
            >
              <img
                src={course.image_url}
                alt={course.title}
                className="h-56 w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              
              <div className="absolute bottom-0 left-0 right-0 p-6 space-y-4">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-white tracking-tight leading-tight">{course.title}</h3>
                  <p className="text-xs text-gold-400/80 font-medium tracking-widest uppercase">Mentor: {course.mentor}</p>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="inline-block bg-gold-400/20 text-gold-300 font-medium text-xs px-4 py-2 rounded-full tracking-wide border border-gold-400/30">
                    {getAccessText(course)}
                  </span>

                  <button
                    onClick={() => setSelectedCourse(course)}
                    className="bg-gradient-to-r from-gold-400 to-gold-500 hover:from-gold-300 hover:to-gold-400 text-black font-bold py-3 px-6 rounded-full shadow-lg shadow-gold-900/30 transition-all duration-500 transform hover:scale-105 hover:shadow-xl hover:shadow-gold-900/40 text-xs tracking-widest uppercase"
                  >
                    Reservar
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </main>

      {selectedCourse && (
        <CoursePlayerModal
          course={selectedCourse}
          onClose={() => setSelectedCourse(null)}
        />
      )}
    </div>
  );
}
