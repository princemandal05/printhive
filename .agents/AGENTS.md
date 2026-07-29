# PrintHive Architecture Guidelines & Rules

Always follow this exact technology stack and architectural blueprint when developing PrintHive:

## 🎨 Frontend Stack
- **Framework**: Next.js (App Router, React)
- **Styling**: Tailwind CSS & Modern Glassmorphic CSS
- **3D Graphics**: Three.js & React Three Fiber (@react-three/fiber, @react-three/drei)
- **Maps & Geolocation**: Leaflet.js & OpenStreetMap (for nearby printer matching)

## ⚡ Backend Stack
- **API Layer**: Next.js API Routes (`app/api/*`)
- **Authentication**: Supabase Auth (`@supabase/ssr`, `@supabase/supabase-js`)
- **Realtime Updates**: Supabase Realtime (Order status pushing)
- **Database**: PostgreSQL (hosted via Supabase)
- **AI Intelligence Engine**: Google Gemini API (`@google/genai` or Gemini REST endpoints)
- **Media & File Storage**: Cloudinary (Image & STL/3MF file uploads)
- **Payment Processing**: Razorpay (Escrow-protected transactions)
- **Notifications**: EmailJS (Order emails & bid notifications)

## 🗄️ Database
- **Engine**: PostgreSQL via Supabase RLS policies
