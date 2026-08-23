"use client";

import { useState } from "react";
import { Badge, Btn, Card } from "@/components/ui";
import { useLang } from "@/lib/lang";
import { S } from "@/lib/strings";
import type { FormFieldHotspot, FormTutorial } from "@/lib/types";

interface FormTutorialViewerProps {
  tutorial: FormTutorial;
  initialStep?: number;
}

export function FormTutorialViewer({
  tutorial,
  initialStep = 0,
}: FormTutorialViewerProps) {
  const { t } = useLang();
  const [currentStepIdx, setCurrentStepIdx] = useState(
    Math.min(initialStep, tutorial.steps.length - 1),
  );
  const [activeTab, setActiveTab] = useState<"walkthrough" | "simulator" | "docs">("walkthrough");
  const [selectedHotspotId, setSelectedHotspotId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(false);

  // Practice Simulator State
  const [simValues, setSimValues] = useState<Record<string, string>>({});
  const [simValidated, setSimValidated] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const currentStep = tutorial.steps[currentStepIdx] || tutorial.steps[0];
  const hotspots = currentStep.hotspots || [];

  // Default to first hotspot if none selected
  const activeHotspot: FormFieldHotspot | undefined =
    hotspots.find((h) => h.id === selectedHotspotId) || hotspots[0];

  const handleNextStep = () => {
    if (currentStepIdx < tutorial.steps.length - 1) {
      setCurrentStepIdx((prev) => prev + 1);
      setSelectedHotspotId(null);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx((prev) => prev - 1);
      setSelectedHotspotId(null);
    }
  };

  const handleSimulateValidation = () => {
    const errors: Record<string, string> = {};
    hotspots.forEach((h) => {
      const val = (simValues[h.id] || "").trim();
      if (h.required && !val) {
        errors[h.id] = t({
          en: `This field is required on the official portal.`,
          hi: `यह फ़ील्ड आधिकारिक पोर्टल पर भरना अनिवार्य है।`,
        });
      } else if (h.input_type === "number" && val && isNaN(Number(val))) {
        errors[h.id] = t({
          en: `Please enter numbers only.`,
          hi: `कृपया केवल संख्यात्मक अंक दर्ज करें।`,
        });
      } else if (h.id.includes("samagra") && val && val.length !== 9) {
        errors[h.id] = t({
          en: `Member Samagra ID must be exactly 9 digits.`,
          hi: `सदस्य समग्र आईडी ठीक 9 अंकों की होनी चाहिए।`,
        });
      }
    });

    setValidationErrors(errors);
    setSimValidated(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="blue">{t(tutorial.category)}</Badge>
              <Badge
                tone={
                  tutorial.difficulty === "easy"
                    ? "green"
                    : tutorial.difficulty === "medium"
                      ? "amber"
                      : "red"
                }
              >
                {t(S.difficulty)}: {t(S[tutorial.difficulty])}
              </Badge>
              <Badge tone="slate">⏱️ {t(tutorial.estimated_time)}</Badge>
            </div>
            <h1 className="mt-2 text-xl font-bold text-slate-900 sm:text-2xl">
              {t(tutorial.title)}
            </h1>
            <p className="mt-1 text-sm text-slate-600">{t(tutorial.summary)}</p>
          </div>

          <a
            href={tutorial.portal_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3.5 py-2 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-200 hover:bg-blue-100 transition"
          >
            <span>↗</span> {t(S.openOfficialPortal)}: {t(tutorial.portal_name)}
          </a>
        </div>

        {/* View Mode Tabs */}
        <div className="mt-6 flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
          <button
            onClick={() => setActiveTab("walkthrough")}
            className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition ${
              activeTab === "walkthrough"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <span>📸</span> {t(S.interactiveTour)}
          </button>
          <button
            onClick={() => setActiveTab("simulator")}
            className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition ${
              activeTab === "simulator"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <span>✍️</span> {t(S.practiceMode)}
          </button>
          <button
            onClick={() => setActiveTab("docs")}
            className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition ${
              activeTab === "docs"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <span>📄</span> {t(S.docPrep)}
          </button>
        </div>

        {/* Step Progression Bar */}
        {tutorial.steps.length > 1 && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-2">
              <span>
                {t(S.stepOf)} {currentStep.step_number} {t(S.of)} {tutorial.steps.length}:{" "}
                <span className="text-slate-900">{t(currentStep.title)}</span>
              </span>
              <span>
                {Math.round(((currentStepIdx + 1) / tutorial.steps.length) * 100)}% {t(S.allSteps)}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-blue-600 transition-all duration-300"
                style={{
                  width: `${((currentStepIdx + 1) / tutorial.steps.length) * 100}%`,
                }}
              />
            </div>

            {/* Quick Step Buttons */}
            <div className="mt-3 flex flex-wrap gap-2">
              {tutorial.steps.map((s, idx) => (
                <button
                  key={s.step_number}
                  onClick={() => {
                    setCurrentStepIdx(idx);
                    setSelectedHotspotId(null);
                  }}
                  className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition ${
                    idx === currentStepIdx
                      ? "bg-slate-900 text-white font-semibold shadow-sm"
                      : idx < currentStepIdx
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <span>{idx < currentStepIdx ? "✓" : s.step_number}.</span>
                  <span className="truncate max-w-[140px]">{t(s.title)}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Tab 1: Interactive Screenshot & Hotspot Walkthrough */}
      {activeTab === "walkthrough" && (
        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
          {/* Left Column: Interactive Screenshot Canvas */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Badge
                  tone={
                    currentStep.screenshot_type === "official_screenshot" ? "green" : "amber"
                  }
                >
                  {currentStep.screenshot_type === "official_screenshot"
                    ? `◉ ${t(S.officialScreenshot)}`
                    : `✎ ${t(S.simulatedVisual)}`}
                </Badge>
                <span className="text-xs text-slate-500">
                  {hotspots.length} {t(S.fieldInspector)} Pins
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setZoom(!zoom)}
                  className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  title={t(S.zoomScreenshot)}
                >
                  🔍 {zoom ? "Fit View" : "Enlarge (120%)"}
                </button>
              </div>
            </div>

            {/* Visual Screenshot Frame with Interactive Hotspots */}
            <div
              className={`relative overflow-hidden rounded-xl border-2 transition-all bg-slate-900 shadow-md ${
                currentStep.screenshot_type === "official_screenshot"
                  ? "border-emerald-500"
                  : "border-amber-500"
              }`}
            >
              <div
                className={`relative transition-transform duration-300 ${
                  zoom ? "scale-110 origin-top-left" : "scale-100"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentStep.screenshot_asset}
                  alt={t(currentStep.title)}
                  className="block w-full select-none"
                />

                {/* Hotspot Pins Overlay */}
                {hotspots.map((hotspot) => {
                  const isSelected = activeHotspot?.id === hotspot.id;
                  return (
                    <div
                      key={hotspot.id}
                      style={{
                        left: `${hotspot.position.x}%`,
                        top: `${hotspot.position.y}%`,
                        width: `${hotspot.position.w}%`,
                        height: `${hotspot.position.h}%`,
                      }}
                      className="absolute"
                    >
                      {/* Bounding Box Highlight */}
                      <button
                        type="button"
                        onClick={() => setSelectedHotspotId(hotspot.id)}
                        className={`size-full rounded-md border-2 transition-all cursor-pointer ${
                          isSelected
                            ? "border-blue-600 bg-blue-500/20 ring-4 ring-blue-400/50 animate-pulse"
                            : "border-dashed border-red-500/80 bg-red-500/10 hover:border-red-600 hover:bg-red-500/20"
                        }`}
                        title={t(hotspot.field_name)}
                      />

                      {/* Numbered Pin Badge */}
                      <button
                        type="button"
                        onClick={() => setSelectedHotspotId(hotspot.id)}
                        style={{
                          left: "0px",
                          top: "-12px",
                        }}
                        className={`absolute -translate-y-1/2 flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold shadow-lg transition-transform ${
                          isSelected
                            ? "scale-115 bg-blue-600 text-white ring-2 ring-white"
                            : "bg-red-600 text-white hover:scale-110"
                        }`}
                      >
                        <span className="size-4 grid place-items-center rounded-full bg-white/20 text-[10px]">
                          {hotspot.badge_number}
                        </span>
                        <span className="hidden sm:inline text-[11px] whitespace-nowrap">
                          {t(hotspot.field_name)}
                        </span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Helper Caption */}
            <p className="text-xs text-slate-500 flex items-center gap-1.5">
              <span>💡</span> {t(S.clickToInspect)}
            </p>

            {/* Step Checklist */}
            {currentStep.checklist && currentStep.checklist.length > 0 && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  📋 Step Checklist
                </h3>
                <ul className="mt-2 space-y-1.5 text-xs text-slate-700">
                  {currentStep.checklist.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>{t(item)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Navigation Buttons for Steps */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <Btn
                variant="secondary"
                onClick={handlePrevStep}
                disabled={currentStepIdx === 0}
              >
                ← {t(S.previous)} {t(S.stepOf)}
              </Btn>

              <div className="flex items-center gap-2">
                {currentStepIdx < tutorial.steps.length - 1 ? (
                  <Btn onClick={handleNextStep}>{t(S.next)} {t(S.stepOf)} →</Btn>
                ) : (
                  <Btn
                    variant="primary"
                    onClick={() => setActiveTab("simulator")}
                  >
                    🚀 {t(S.trySimulator)}
                  </Btn>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Smart Field Inspector Panel */}
          <div className="space-y-4">
            {activeHotspot ? (
              <Card className="border-blue-200 bg-blue-50/20 p-5 shadow-sm space-y-4">
                <div className="flex items-start justify-between gap-2 border-b border-blue-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="grid size-6 place-items-center rounded-full bg-blue-600 text-xs font-bold text-white">
                        {activeHotspot.badge_number}
                      </span>
                      <span className="text-xs font-semibold uppercase tracking-wider text-blue-700">
                        {t(S.activeHotspot)}
                      </span>
                      <Badge tone={activeHotspot.required ? "red" : "slate"}>
                        {t(activeHotspot.required ? S.required : S.optional)}
                      </Badge>
                    </div>
                    <h2 className="mt-1.5 text-base font-bold text-slate-900">
                      {t(activeHotspot.field_name)}
                    </h2>
                  </div>
                </div>

                {/* What to Enter */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {t(S.whatToEnter)}
                  </p>
                  <p className="mt-1 text-sm text-slate-800 leading-relaxed font-medium">
                    {t(activeHotspot.what_to_enter)}
                  </p>
                </div>

                {/* Sample Valid Value */}
                {activeHotspot.sample_value && (
                  <div className="rounded-lg border border-slate-200 bg-white p-3">
                    <p className="text-xs font-medium text-slate-500">
                      {t(S.sampleValue)}
                    </p>
                    <div className="mt-1 flex items-center justify-between">
                      <code className="font-mono text-sm font-semibold text-emerald-700">
                        {activeHotspot.sample_value}
                      </code>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(activeHotspot.sample_value);
                          alert("Sample value copied to clipboard!");
                        }}
                        className="text-xs font-medium text-slate-500 hover:text-slate-900 underline"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                )}

                {/* Pro Tip */}
                {activeHotspot.pro_tip && (
                  <div className="rounded-lg bg-emerald-50 p-3 ring-1 ring-inset ring-emerald-200">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                      <span>💡</span> {t(S.proTip)}
                    </div>
                    <p className="mt-1 text-xs text-emerald-800">
                      {t(activeHotspot.pro_tip)}
                    </p>
                  </div>
                )}

                {/* Common Rejection Trap */}
                {activeHotspot.common_mistake && (
                  <div className="rounded-lg bg-amber-50 p-3 ring-1 ring-inset ring-amber-200">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                      <span>⚠️</span> {t(S.commonTrap)}
                    </div>
                    <p className="mt-1 text-xs text-amber-800">
                      {t(activeHotspot.common_mistake)}
                    </p>
                  </div>
                )}

                {/* Field Selection Quick List */}
                <div className="border-t border-blue-100 pt-3">
                  <p className="text-xs font-semibold text-slate-600 mb-2">
                    Fields on this screen:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {hotspots.map((h) => (
                      <button
                        key={h.id}
                        onClick={() => setSelectedHotspotId(h.id)}
                        className={`rounded px-2 py-1 text-xs font-medium transition ${
                          activeHotspot.id === h.id
                            ? "bg-blue-600 text-white font-semibold"
                            : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {h.badge_number}. {t(h.field_name)}
                      </button>
                    ))}
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="p-5 text-center text-sm text-slate-500">
                {t(S.clickToInspect)}
              </Card>
            )}

            {/* Prerequisites Checklist */}
            <Card className="p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <span>📁</span> {t(S.prerequisites)}
              </h3>
              <ul className="mt-3 space-y-2 text-xs text-slate-700">
                {tutorial.prerequisites.map((p, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">●</span>
                    <span>{t(p)}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      )}

      {/* Main Tab 2: Interactive Form Practice Simulator */}
      {activeTab === "simulator" && (
        <Card className="p-6">
          <div className="max-w-2xl">
            <Badge tone="blue">Practice Mode (सुरक्षित अभ्यास)</Badge>
            <h2 className="mt-2 text-lg font-bold text-slate-900">
              {t(S.practiceMode)}: {t(tutorial.title)}
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              {t(S.testYourInputs)}
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSimulateValidation();
              }}
              className="mt-6 space-y-4"
            >
              {tutorial.steps.flatMap((step) => step.hotspots).map((hotspot) => {
                const err = validationErrors[hotspot.id];
                return (
                  <div key={hotspot.id} className="space-y-1">
                    <label className="flex items-center justify-between text-xs font-semibold text-slate-900">
                      <span>
                        {t(hotspot.field_name)}{" "}
                        {hotspot.required && <span className="text-red-500">*</span>}
                      </span>
                      <span className="text-[11px] font-normal text-slate-500">
                        {t(S.sampleValue)}: {hotspot.sample_value}
                      </span>
                    </label>

                    {hotspot.input_type === "select" && hotspot.options ? (
                      <select
                        value={simValues[hotspot.id] || ""}
                        onChange={(e) => {
                          setSimValues({ ...simValues, [hotspot.id]: e.target.value });
                          if (simValidated) setSimValidated(false);
                        }}
                        className={`w-full rounded-lg border px-3 py-2 text-sm ${
                          err
                            ? "border-red-500 bg-red-50 focus:ring-red-500"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        <option value="">-- {t({ en: "Select", hi: "चुनें" })} --</option>
                        {hotspot.options.map((opt, optIdx) => (
                          <option key={optIdx} value={opt.en}>
                            {t(opt)}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={hotspot.input_type === "number" ? "text" : hotspot.input_type || "text"}
                        placeholder={hotspot.sample_value}
                        value={simValues[hotspot.id] || ""}
                        onChange={(e) => {
                          setSimValues({ ...simValues, [hotspot.id]: e.target.value });
                          if (simValidated) setSimValidated(false);
                        }}
                        className={`w-full rounded-lg border px-3 py-2 text-sm ${
                          err
                            ? "border-red-500 bg-red-50 focus:ring-red-500"
                            : "border-slate-300 bg-white"
                        }`}
                      />
                    )}

                    {err ? (
                      <p className="text-xs font-medium text-red-600">❌ {err}</p>
                    ) : (
                      <p className="text-[11px] text-slate-500">{t(hotspot.what_to_enter)}</p>
                    )}
                  </div>
                );
              })}

              <div className="pt-4 flex flex-wrap items-center gap-3">
                <Btn type="submit">✓ {t(S.simulateSubmit)}</Btn>
                <Btn
                  variant="secondary"
                  onClick={() => {
                    const prefill: Record<string, string> = {};
                    tutorial.steps
                      .flatMap((s) => s.hotspots)
                      .forEach((h) => {
                        prefill[h.id] = h.sample_value;
                      });
                    setSimValues(prefill);
                    setValidationErrors({});
                    setSimValidated(false);
                  }}
                >
                  ⚡ Auto-fill Sample Data
                </Btn>
              </div>

              {simValidated && Object.keys(validationErrors).length === 0 && (
                <div className="rounded-xl bg-emerald-50 p-4 ring-1 ring-emerald-300">
                  <p className="text-sm font-bold text-emerald-900">
                    🎉 {t(S.validationSuccess)}
                  </p>
                  <p className="mt-1 text-xs text-emerald-800">
                    You understand all input formats. You can now proceed to the official portal without hesitation!
                  </p>
                  <a
                    href={tutorial.portal_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-block rounded-lg bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800 transition"
                  >
                    Open {t(tutorial.portal_name)} →
                  </a>
                </div>
              )}
            </form>
          </div>
        </Card>
      )}

      {/* Main Tab 3: Document Preparation & Scanner Guide */}
      {activeTab === "docs" && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-5 space-y-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>📄</span> {t(S.compressDocsHint)}
            </h3>
            <p className="text-xs text-slate-600">
              Follow these simple rules so government verification officers never reject your uploaded scans:
            </p>

            <div className="space-y-2.5 pt-2">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3">
                <p className="text-xs font-bold text-emerald-900">✓ Do: Flat, Well-Lit Document Scan</p>
                <p className="text-xs text-emerald-800 mt-0.5">
                  Scan directly from above with no shadows across text. Ensure government seals and stamps are legible.
                </p>
              </div>

              <div className="rounded-lg border border-red-200 bg-red-50/50 p-3">
                <p className="text-xs font-bold text-red-900">✕ Don&apos;t: Angled Smartphone Photo</p>
                <p className="text-xs text-red-800 mt-0.5">
                  Photos with flash glare, cropped corners, or blurry registration numbers are automatically sent back.
                </p>
              </div>

              <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-3">
                <p className="text-xs font-bold text-blue-900">ℹ️ File Format &amp; Size Target</p>
                <p className="text-xs text-blue-800 mt-0.5">
                  Format: <strong>PDF or JPG</strong> • Target size: <strong>100 KB to 180 KB</strong>.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-5 space-y-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>⚠️</span> {t(S.rejectionPrevention)}
            </h3>
            <div className="space-y-2.5 pt-2">
              {tutorial.common_rejections.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-amber-200 bg-amber-50/50 p-3"
                >
                  <p className="text-xs font-bold text-amber-900">
                    ❌ Trap: {t(item.reason)}
                  </p>
                  <p className="mt-1 text-xs text-slate-700">
                    <span className="font-semibold text-emerald-700">Solution:</span>{" "}
                    {t(item.prevention)}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
