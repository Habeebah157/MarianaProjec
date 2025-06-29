import React from "react";

export default function PrayerTime() {
  return (
    <div className="max-w-sm mx-auto p-6 bg-gradient-to-b from-indigo-50 via-indigo-100 to-indigo-50 rounded-3xl shadow-lg relative font-serif text-indigo-900 my-9">
      {/* Arch-shaped container */}
      <div className="bg-white rounded-t-full rounded-b-3xl border-4 border-indigo-700 p-6 pt-16 shadow-inner">
        <h2 className="text-center text-3xl font-bold mb-6 tracking-wide">
          أوقات الصلاة
        </h2>
        <ul className="space-y-3 text-lg font-semibold">
          <li className="flex justify-between border-b border-indigo-200 pb-2">
            <span>الفجر</span>
            <span>--:--</span>
          </li>
          <li className="flex justify-between border-b border-indigo-200 pb-2">
            <span>الظهر</span>
            <span>--:--</span>
          </li>
          <li className="flex justify-between border-b border-indigo-200 pb-2">
            <span>العصر</span>
            <span>--:--</span>
          </li>
          <li className="flex justify-between border-b border-indigo-200 pb-2">
            <span>المغرب</span>
            <span>--:--</span>
          </li>
          <li className="flex justify-between">
            <span>العشاء</span>
            <span>--:--</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
