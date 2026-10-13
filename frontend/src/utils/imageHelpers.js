const doctorAvatars = [
  "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1629425733761-caae3b5f2e50?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=600&q=80",
];

const hospitalCovers = [
  "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1584982751601-97dcc096659c?auto=format&fit=crop&w=1000&q=80",
];

/**
 * Returns a valid doctor profile image URL with hash-based fallback.
 */
export function getDoctorImage(doctor, index = 0) {
  if (!doctor) return doctorAvatars[0];
  const url =
    doctor.profileImage ||
    doctor.image ||
    doctor.imageUrl ||
    doctor.avatar ||
    doctor.photo ||
    doctor.user?.profileImage ||
    doctor.user?.avatar;

  if (url && typeof url === "string" && url.trim().length > 0) {
    return url;
  }

  const idStr = String(doctor._id || doctor.id || doctor.name || index);
  let hash = 0;
  for (let i = 0; i < idStr.length; i++) {
    hash = idStr.charCodeAt(i) + ((hash << 5) - hash);
  }
  const pos = Math.abs(hash) % doctorAvatars.length;
  return doctorAvatars[pos];
}

/**
 * Returns a valid hospital cover image URL with hash-based fallback.
 */
export function getHospitalImage(hospital, index = 0) {
  if (!hospital) return hospitalCovers[0];
  const url =
    hospital.coverImage ||
    hospital.logo ||
    hospital.image ||
    hospital.imageUrl ||
    hospital.photo;

  if (url && typeof url === "string" && url.trim().length > 0) {
    return url;
  }

  const idStr = String(hospital._id || hospital.id || hospital.name || index);
  let hash = 0;
  for (let i = 0; i < idStr.length; i++) {
    hash = idStr.charCodeAt(i) + ((hash << 5) - hash);
  }
  const pos = Math.abs(hash) % hospitalCovers.length;
  return hospitalCovers[pos];
}

export const FALLBACK_DOCTOR_IMAGE = doctorAvatars[0];
export const FALLBACK_HOSPITAL_IMAGE = hospitalCovers[0];
