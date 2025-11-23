import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Course } from '../lib/supabase';

export default function CursosPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

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
      return 'Acceso Gratuito';
    }
    if (user?.membership_type === 'platinum') {
      return `${course.platinum_discount}% OFF`;
    }
    return `${course.gold_discount}% OFF`;
  };

  return (
    <div className="flex-1 overflow-y-auto pb-24">
      <header className="sticky top-0 z-40 bg-[#0a0a0a]/80 backdrop-blur-lg border-b border-white/10 p-4">
        <h1 className="text-2xl font-bold text-white text-center tracking-tight">Educación y Mentoría</h1>
      </header>

      <main className="p-4 space-y-6">
        <p className="text-gray-400 text-center font-light leading-relaxed">
          Como miembro{' '}
          <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-600">
            {getMembershipText()}
          </span>
          , tiene acceso a beneficios exclusivos en todos los cursos.
        </p>

        {loading ? (
          <div className="text-center text-gray-400 py-8">Cargando cursos...</div>
        ) : (
          courses.map((course) => (
            <div
              key={course.id}
              className="bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden"
            >
              <img
                src={course.image_url}
                alt={course.title}
                className="h-40 w-full object-cover"
              />
              <div className="p-4">
                <h3 className="text-lg font-bold text-white tracking-tight">{course.title}</h3>
                <p className="text-sm text-gray-400 mb-3 font-light">Mentor: {course.mentor}</p>

                <div className="mb-4">
                  <span className="inline-block bg-yellow-600/20 text-yellow-400 font-medium text-sm px-3 py-1 rounded-full tracking-wide">
                    {getAccessText(course)}
                  </span>
                </div>

                <button
                  onClick={() => alert('Reproductor de curso próximamente')}
                  className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-semibold py-2 rounded-lg text-sm hover:shadow-lg hover:shadow-yellow-500/50 transition-all tracking-wide"
                >
                  Comenzar Curso
                </button>
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}
