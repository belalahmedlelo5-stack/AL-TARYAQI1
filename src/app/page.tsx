// ============================================
// LANDING PAGE - AL-TARYAQI
// High-converting Arabic landing page
// ============================================

import Link from 'next/link';
import { 
  ArrowLeft, 
  TrendingDown, 
  Clock, 
  Users, 
  Shield, 
  Star,
  CheckCircle,
  Package,
  MessageSquare,
  Award
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center">
                <span className="text-xl">🧪</span>
              </div>
              <span className="font-bold text-xl text-gray-900">AL-TARYAQI</span>
            </div>
            <div className="flex items-center gap-4">
              <Link 
                href="/login" 
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                تسجيل الدخول
              </Link>
              <Link 
                href="/register" 
                className="bg-teal-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-teal-700 transition-colors"
              >
                إنشاء حساب
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-teal-50 via-white to-blue-50 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-right">
              <div className="inline-flex items-center gap-2 bg-teal-100 text-teal-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <TrendingDown className="w-4 h-4" />
                وفر حتى 30% من مشتريات المعمل
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                منصة المناقصات
                <span className="text-teal-600 block">للمستلزمات الطبية</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                انشر طلبك واحصل على عروض أسعار متعددة من موردين معتمدين.
                قارن الأسعار واختر الأفضل بكل شفافية.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link 
                  href="/register" 
                  className="bg-teal-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-teal-700 transition-colors flex items-center justify-center gap-2"
                >
                  ابدأ الآن مجاناً
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <Link 
                  href="#how-it-works" 
                  className="bg-white text-gray-700 border-2 border-gray-200 px-8 py-4 rounded-xl font-bold text-lg hover:border-teal-600 hover:text-teal-600 transition-colors"
                >
                  كيف يعمل؟
                </Link>
              </div>
              
              {/* Trust badges */}
              <div className="mt-10 flex items-center justify-center lg:justify-start gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>بدون عمولة على الموردين</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>تسجيل مجاني</span>
                </div>
              </div>
            </div>
            
            {/* Hero Illustration */}
            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-blue-500 rounded-3xl opacity-10 blur-3xl"></div>
                <div className="relative bg-white rounded-3xl shadow-2xl p-8">
                  {/* Mock Order Card */}
                  <div className="bg-gray-50 rounded-2xl p-6 mb-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                        <Package className="w-6 h-6 text-teal-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">طلب مستلزمات مختبر</p>
                        <p className="text-sm text-gray-500">15 منتج مختلف</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">قفازات طبية × 50</span>
                        <span className="font-medium">2,500 ج</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">محقنة 5ml × 100</span>
                        <span className="font-medium">1,800 ج</span>
                      </div>
                      <div className="border-t pt-2 mt-2">
                        <div className="flex justify-between font-semibold">
                          <span>الإجمالي</span>
                          <span className="text-teal-600">4,300 ج</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Mock Offers */}
                  <div className="space-y-3">
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Award className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="font-semibold text-gray-900">أفضل عرض</p>
                          <p className="text-sm text-gray-500">شركة المستلزمات الطبية</p>
                        </div>
                      </div>
                      <span className="text-xl font-bold text-green-600">4,100 ج</span>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between opacity-60">
                      <div>
                        <p className="font-medium text-gray-900">مورد ثاني</p>
                        <p className="text-sm text-gray-500">توصيل خلال 3 أيام</p>
                      </div>
                      <span className="text-lg font-medium text-gray-600">4,350 ج</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-teal-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center text-white">
            <div>
              <p className="text-4xl lg:text-5xl font-bold mb-2">500+</p>
              <p className="text-teal-100">طلب منفذ</p>
            </div>
            <div>
              <p className="text-4xl lg:text-5xl font-bold mb-2">50+</p>
              <p className="text-teal-100">مورد معتمد</p>
            </div>
            <div>
              <p className="text-4xl lg:text-5xl font-bold mb-2">30%</p>
              <p className="text-teal-100">متوسط التوفير</p>
            </div>
            <div>
              <p className="text-4xl lg:text-5xl font-bold mb-2">4.8</p>
              <p className="text-teal-100">تقييم المنصة</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              كيف يعمل AL-TARYAQI؟
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              ثلاث خطوات بسيطة للحصول على أفضل أسعار المستلزمات الطبية
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Package className="w-10 h-10 text-teal-600" />
              </div>
              <div className="w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold mx-auto -mt-14 mb-4 border-4 border-white">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">انشر طلبك</h3>
              <p className="text-gray-600 leading-relaxed">
                اكتب تفاصيل المستلزمات التي تحتاجها مع الكميات المطلوبة. حدد موعد التسليم المناسب.
              </p>
            </div>
            
            {/* Step 2 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <MessageSquare className="w-10 h-10 text-blue-600" />
              </div>
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mx-auto -mt-14 mb-4 border-4 border-white">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">استلم العروض</h3>
              <p className="text-gray-600 leading-relaxed">
                تلقى عروض أسعار متعددة من موردين معتمدين. قارن بين الأسعار ومدة التسليم.
              </p>
            </div>
            
            {/* Step 3 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold mx-auto -mt-14 mb-4 border-4 border-white">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">اختر الأفضل</h3>
              <p className="text-gray-600 leading-relaxed">
                اختر العرض الأنسب لك واتمم عملية الشراء بأمان. المنصة تضمن حقوقك.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              لماذا AL-TARYAQI؟
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                <TrendingDown className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">وفر حتى 30%</h3>
              <p className="text-gray-600">
                المنافسة بين الموردين تضمن لك الحصول على أفضل الأسعار في السوق.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <Clock className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">وفر الوقت</h3>
              <p className="text-gray-600">
                لا حاجة للاتصال بموردين متعددين. انشر طلبك مرة واحدة واستلم جميع العروض.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">موردين معتمدين</h3>
              <p className="text-gray-600">
                جميع الموردين على المنصة يتم التحقق منهم لضمان الجودة والموثوقية.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center mb-6">
                <Shield className="w-7 h-7 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">حماية كاملة</h3>
              <p className="text-gray-600">
                المنصة تضمن حقوقك كمشتري وتحمي بياناتك من التسريب.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-teal-100 rounded-xl flex items-center justify-center mb-6">
                <Star className="w-7 h-7 text-teal-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">تقييمات موثوقة</h3>
              <p className="text-gray-600">
                اطلع على تقييمات الموردين السابقة قبل اتخاذ قرارك.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-pink-100 rounded-xl flex items-center justify-center mb-6">
                <Award className="w-7 h-7 text-pink-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">بدون رسوم خفية</h3>
              <p className="text-gray-600">
                أسعار شفافة بدون عمولة على الموردين. تدفع فقط قيمة طلبك.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-teal-600 to-blue-600 rounded-3xl p-8 lg:p-16 text-white text-center">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              انضم إلى آلاف المشتري والموردين
            </h2>
            <p className="text-xl text-teal-100 mb-10 max-w-2xl mx-auto">
              منصة AL-TARYAQI تربط بين المعامل والصيدليات والموردين المعتمدين في جميع أنحاء مصر.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/register" 
                className="bg-white text-teal-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors"
              >
                سجل كمشتري
              </Link>
              <Link 
                href="/register?role=supplier" 
                className="bg-teal-700 text-white border-2 border-teal-500 px-8 py-4 rounded-xl font-bold text-lg hover:bg-teal-800 transition-colors"
              >
                سجل كمورد
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center">
                  <span className="text-xl">🧪</span>
                </div>
                <span className="font-bold text-xl text-white">AL-TARYAQI</span>
              </div>
              <p className="text-gray-400">
                منصة المناقصات الطبية لربط المشترين بالموردين المعتمدين.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">للمشترين</h4>
              <ul className="space-y-2">
                <li><Link href="/register" className="hover:text-white transition-colors">إنشاء حساب</Link></li>
                <li><Link href="#how-it-works" className="hover:text-white transition-colors">كيف يعمل</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">الأسئلة الشائعة</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">للموردين</h4>
              <ul className="space-y-2">
                <li><Link href="/register?role=supplier" className="hover:text-white transition-colors">التسجيل كمورد</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">شروط الموردين</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">العمولة</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">الدعم</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="hover:text-white transition-colors">اتصل بنا</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">الشروط والأحكام</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">سياسة الخصوصية</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center text-gray-500">
            <p>© 2024 AL-TARYAQI. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
