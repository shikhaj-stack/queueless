import { L, type Location, type Service } from "../types.ts";

const MPEDISTRICT = "https://mpedistrict.gov.in";

/** Steps shared by every MP e-District certificate flow — one source, not per-service copies. */
const eDistrictSteps = (formName: { en: string; hi?: string }): Service["steps"] => [
  {
    number: 1,
    title: L("Open the MP e-District portal", "एमपी ई-डिस्ट्रिक्ट पोर्टल खोलें"),
    instruction: L(
      `Go to ${MPEDISTRICT} and click "Citizen Login" in the top-right corner. If you do not have an account, click "Register" first.`,
      `${MPEDISTRICT} पर जाएँ और ऊपर दाईं ओर "Citizen Login" पर क्लिक करें। खाता न हो तो पहले "Register" पर क्लिक करें।`,
    ),
    tip: L(
      "Register with the mobile number linked to your Aadhaar — the OTP goes there.",
      "उसी मोबाइल नंबर से रजिस्टर करें जो आधार से जुड़ा है — OTP वहीं आएगा।",
    ),
    visual: {
      type: "official_screenshot",
      asset: "/guides/portal-home.svg",
      highlight: {
        label: L("Citizen Login", "सिटीजन लॉगिन"),
        box: [72, 8, 24, 12],
      },
    },
  },
  {
    number: 2,
    title: L("Find the service form", "सेवा फॉर्म खोजें"),
    instruction: L(
      `After login, open "Services" and search for "${formName.en}". Click Apply.`,
      `लॉगिन के बाद "Services" खोलें और "${formName.hi ?? formName.en}" खोजें। Apply पर क्लिक करें।`,
    ),
    visual: {
      type: "official_screenshot",
      asset: "/guides/form-fill.svg",
      highlight: {
        label: L("Search box", "खोज बॉक्स"),
        box: [8, 22, 55, 14],
      },
    },
  },
  {
    number: 3,
    title: L("Fill your details", "अपना विवरण भरें"),
    instruction: L(
      "Enter your name, father's name, address and Samagra ID exactly as they appear on your Aadhaar. Any mismatch sends the application back.",
      "अपना नाम, पिता का नाम, पता और समग्र आईडी आधार के अनुसार ही भरें। अंतर होने पर आवेदन वापस आ जाता है।",
    ),
    tip: L(
      "Keep your Samagra ID handy — the form will not submit without it.",
      "समग्र आईडी पास रखें — इसके बिना फॉर्म जमा नहीं होगा।",
    ),
    visual: {
      type: "simulated",
      asset: "/guides/form-fields.svg",
      highlight: {
        label: L("Samagra ID field", "समग्र आईडी फ़ील्ड"),
        box: [10, 55, 50, 12],
      },
    },
  },
  {
    number: 4,
    title: L("Upload documents", "दस्तावेज़ अपलोड करें"),
    instruction: L(
      "Upload each document as a clear PDF or JPG under 200 KB. Scan, don't photograph at an angle.",
      "प्रत्येक दस्तावेज़ को साफ़ PDF या JPG में 200 KB से कम आकार में अपलोड करें। तिरछी फ़ोटो न लें।",
    ),
    visual: {
      type: "official_screenshot",
      asset: "/guides/upload-docs.svg",
      highlight: {
        label: L("Choose file", "फ़ाइल चुनें"),
        box: [60, 40, 30, 12],
      },
    },
  },
  {
    number: 5,
    title: L("Pay and save the receipt", "भुगतान करें और रसीद सहेजें"),
    instruction: L(
      "Pay the fee online, then download the acknowledgement PDF. The application number on it is what you use to track status.",
      "शुल्क ऑनलाइन जमा करें, फिर पावती PDF डाउनलोड करें। उस पर लिखा आवेदन क्रमांक ही स्थिति देखने के लिए काम आता है।",
    ),
    tip: L(
      "Screenshot the application number before closing the tab.",
      "टैब बंद करने से पहले आवेदन क्रमांक का स्क्रीनशॉट ले लें।",
    ),
    visual: {
      type: "official_screenshot",
      asset: "/guides/payment.svg",
      highlight: {
        label: L("Application number", "आवेदन क्रमांक"),
        box: [12, 62, 45, 12],
      },
    },
  },
  {
    number: 6,
    title: L("Visit the office if asked", "आवश्यकता पर कार्यालय जाएँ"),
    instruction: L(
      "If the status says 'field verification', visit the tehsil office with your original documents. Join the virtual queue here first so you don't wait in line.",
      "यदि स्थिति 'क्षेत्र सत्यापन' दिखे, तो मूल दस्तावेज़ों के साथ तहसील कार्यालय जाएँ। पहले यहीं वर्चुअल कतार में जुड़ें, ताकि लाइन में खड़ा न होना पड़े।",
    ),
    visual: {
      type: "simulated",
      asset: "/guides/office-counter.svg",
      highlight: {
        label: L("Counter 2 — certificates", "काउंटर 2 — प्रमाण पत्र"),
        box: [30, 30, 40, 20],
      },
    },
  },
];

const aadhaar = {
  name: L("Aadhaar card", "आधार कार्ड"),
  required: true,
  explanation: L(
    "Proof of identity. The name must match every other document you upload.",
    "पहचान का प्रमाण। नाम अन्य सभी दस्तावेज़ों से मेल खाना चाहिए।",
  ),
};

const samagra = {
  name: L("Samagra ID", "समग्र आईडी"),
  required: true,
  explanation: L(
    "Madhya Pradesh family/member ID. Find it on samagra.gov.in using your mobile number.",
    "मध्य प्रदेश परिवार/सदस्य आईडी। samagra.gov.in पर मोबाइल नंबर से खोजें।",
  ),
};

const residenceProof = {
  name: L("Residence proof", "निवास प्रमाण"),
  required: true,
  explanation: L(
    "Electricity bill, water bill or voter ID showing your Bhopal address.",
    "बिजली बिल, पानी बिल या मतदाता पहचान पत्र जिस पर भोपाल का पता हो।",
  ),
};

const photo = {
  name: L("Passport photo", "पासपोर्ट फ़ोटो"),
  required: false,
  explanation: L(
    "Recent photo, under 50 KB. Some tehsils accept the application without it.",
    "हाल की फ़ोटो, 50 KB से कम। कुछ तहसील इसके बिना भी आवेदन ले लेते हैं।",
  ),
};

export const SERVICES: Service[] = [
  {
    slug: "domicile-certificate",
    name: L("Domicile Certificate", "मूल निवासी प्रमाण पत्र"),
    department: L("Revenue Department", "राजस्व विभाग"),
    language_support: ["en", "hi"],
    eligibility: [
      L(
        "You have lived in Madhya Pradesh continuously for at least 10 years.",
        "आप कम से कम 10 वर्षों से लगातार मध्य प्रदेश में रह रहे हैं।",
      ),
      L(
        "Or you were born in Madhya Pradesh and hold local residence proof.",
        "या आपका जन्म मध्य प्रदेश में हुआ है और स्थानीय निवास प्रमाण है।",
      ),
    ],
    fee: L("₹30 (online payment)", "₹30 (ऑनलाइन भुगतान)"),
    processing_time: L("7–15 working days", "7–15 कार्य दिवस"),
    online_available: true,
    physical_visit_required: true,
    official_sources: [
      { url: `${MPEDISTRICT}/`, title: "MP e-District — Citizen Services", accessed_at: "2026-08-14" },
      {
        url: "https://mpedistrict.gov.in/Public/citizen_charter.aspx",
        title: "Citizen Charter (fees & timelines)",
        accessed_at: "2026-08-14",
      },
    ],
    requirements: [
      aadhaar,
      samagra,
      residenceProof,
      {
        name: L("School leaving certificate", "स्कूल छोड़ने का प्रमाण पत्र"),
        required: false,
        explanation: L(
          "Helps prove 10 years of residence if your other documents are recent.",
          "यदि अन्य दस्तावेज़ नए हैं तो 10 वर्ष निवास साबित करने में मदद करता है।",
        ),
      },
      photo,
    ],
    steps: eDistrictSteps(L("Domicile Certificate", "मूल निवासी प्रमाण पत्र")),
    common_mistakes: [
      L(
        "Name spelled differently on Aadhaar and residence proof — the most common rejection reason.",
        "आधार और निवास प्रमाण में नाम की स्पेलिंग अलग — अस्वीकृति का सबसे आम कारण।",
      ),
      L(
        "Uploading a photo of a document instead of a scan, so text is unreadable.",
        "दस्तावेज़ की स्कैन के बजाय फ़ोटो अपलोड करना, जिससे लिखा पढ़ा नहीं जाता।",
      ),
      L(
        "Closing the browser before saving the application number.",
        "आवेदन क्रमांक सहेजने से पहले ब्राउज़र बंद कर देना।",
      ),
    ],
    faqs: [
      {
        q: L("Is a domicile certificate the same as a residence certificate?", "क्या मूल निवासी प्रमाण पत्र और निवास प्रमाण पत्र एक ही हैं?"),
        a: L(
          "No. Domicile proves long-term residence in the state; a residence certificate proves your current address. Colleges usually ask for domicile.",
          "नहीं। मूल निवासी राज्य में दीर्घकालिक निवास साबित करता है; निवास प्रमाण पत्र वर्तमान पता साबित करता है। कॉलेज सामान्यतः मूल निवासी मांगते हैं।",
        ),
      },
      {
        q: L("How long is it valid?", "यह कब तक वैध है?"),
        a: L("Usually lifetime, but some institutions ask for one issued within the last 6 months.", "सामान्यतः जीवनभर, लेकिन कुछ संस्थान 6 माह के भीतर जारी प्रमाण पत्र मांगते हैं।"),
      },
    ],
    verification: { status: "verified", last_checked: "2026-08-14" },
    queue_id: "q-tehsil-huzur-revenue",
    popular: true,
    published: true,
  },
  {
    slug: "income-certificate",
    name: L("Income Certificate", "आय प्रमाण पत्र"),
    department: L("Revenue Department", "राजस्व विभाग"),
    language_support: ["en", "hi"],
    eligibility: [
      L("Any resident of Madhya Pradesh needing proof of family income.", "मध्य प्रदेश का कोई भी निवासी जिसे पारिवारिक आय का प्रमाण चाहिए।"),
      L("Income is assessed for the whole family, not just the applicant.", "आय पूरे परिवार की आंकी जाती है, केवल आवेदक की नहीं।"),
    ],
    fee: L("₹30 (online payment)", "₹30 (ऑनलाइन भुगतान)"),
    processing_time: L("7–10 working days", "7–10 कार्य दिवस"),
    online_available: true,
    physical_visit_required: false,
    official_sources: [
      { url: `${MPEDISTRICT}/`, title: "MP e-District — Citizen Services", accessed_at: "2026-08-10" },
    ],
    requirements: [
      aadhaar,
      samagra,
      {
        name: L("Salary slip or income declaration", "वेतन पर्ची या आय घोषणा"),
        required: true,
        explanation: L(
          "Last 3 months' salary slips if employed, or a self-declaration on plain paper if self-employed.",
          "नौकरी में हों तो पिछले 3 माह की वेतन पर्ची, स्वरोज़गार हो तो सादे कागज़ पर स्व-घोषणा।",
        ),
      },
      {
        name: L("Ration card", "राशन कार्ड"),
        required: false,
        explanation: L("Used to confirm family members listed on the application.", "आवेदन में दर्ज परिवार के सदस्यों की पुष्टि के लिए।"),
      },
    ],
    steps: eDistrictSteps(L("Income Certificate", "आय प्रमाण पत्र")),
    common_mistakes: [
      L(
        "Declaring only the applicant's income instead of total family income.",
        "पूरे परिवार की आय के बजाय केवल आवेदक की आय बताना।",
      ),
      L("Using an income figure that contradicts an earlier certificate.", "पिछले प्रमाण पत्र से विरोधाभासी आय राशि लिखना।"),
    ],
    faqs: [
      {
        q: L("How long is an income certificate valid?", "आय प्रमाण पत्र कब तक वैध है?"),
        a: L("Six months from the date of issue for most scholarship and admission uses.", "छात्रवृत्ति और प्रवेश के लिए सामान्यतः जारी होने की तिथि से छह माह।"),
      },
    ],
    verification: { status: "verified", last_checked: "2026-08-10" },
    queue_id: "q-tehsil-huzur-revenue",
    popular: true,
    published: true,
  },
  {
    slug: "caste-certificate",
    name: L("Caste Certificate (SC/ST/OBC)", "जाति प्रमाण पत्र (अ.जा./अ.ज.जा./ओबीसी)"),
    department: L("Revenue Department", "राजस्व विभाग"),
    language_support: ["en", "hi"],
    eligibility: [
      L("You belong to a caste notified in the Madhya Pradesh SC / ST / OBC list.", "आप मध्य प्रदेश की अ.जा./अ.ज.जा./ओबीसी अधिसूचित सूची की जाति से हैं।"),
      L("Your family has resided in Madhya Pradesh since before 1950 for SC/ST claims.", "अ.जा./अ.ज.जा. दावे के लिए परिवार 1950 से पूर्व से मध्य प्रदेश में निवासरत हो।"),
    ],
    fee: L("₹30 (online payment)", "₹30 (ऑनलाइन भुगतान)"),
    processing_time: L("15–30 working days", "15–30 कार्य दिवस"),
    online_available: true,
    physical_visit_required: true,
    official_sources: [
      { url: `${MPEDISTRICT}/`, title: "MP e-District — Citizen Services", accessed_at: "2026-07-28" },
      {
        url: "https://socialjustice.mp.gov.in/",
        title: "MP Social Justice Department",
        accessed_at: "2026-07-28",
      },
    ],
    requirements: [
      aadhaar,
      samagra,
      {
        name: L("Father's or grandfather's caste certificate", "पिता या दादा का जाति प्रमाण पत्र"),
        required: true,
        explanation: L(
          "A relative's existing certificate is the fastest proof of caste lineage. Without it, expect field verification.",
          "परिवार के किसी सदस्य का पुराना प्रमाण पत्र सबसे तेज़ प्रमाण है। इसके बिना क्षेत्र सत्यापन होगा।",
        ),
      },
      residenceProof,
    ],
    steps: eDistrictSteps(L("Caste Certificate", "जाति प्रमाण पत्र")),
    common_mistakes: [
      L(
        "Choosing the wrong category (OBC instead of SC) — the caste name must match the notified list exactly.",
        "गलत श्रेणी चुनना (अ.जा. के बजाय ओबीसी) — जाति का नाम अधिसूचित सूची से बिल्कुल मेल खाना चाहिए।",
      ),
      L(
        "Applying without any family caste document, which adds weeks of verification.",
        "परिवार के किसी जाति दस्तावेज़ के बिना आवेदन करना, जिससे सत्यापन में हफ़्ते लग जाते हैं।",
      ),
    ],
    faqs: [
      {
        q: L("Do I need to apply again for each child?", "क्या हर बच्चे के लिए अलग आवेदन करना होगा?"),
        a: L("Yes — the certificate is issued per person, though a parent's certificate speeds it up.", "हाँ — प्रमाण पत्र प्रति व्यक्ति जारी होता है, लेकिन माता-पिता का प्रमाण पत्र प्रक्रिया तेज़ करता है।"),
      },
    ],
    verification: { status: "needs_review", last_checked: "2026-07-28" },
    queue_id: "q-tehsil-huzur-revenue",
    popular: true,
    published: true,
  },
  {
    slug: "birth-certificate",
    name: L("Birth Certificate", "जन्म प्रमाण पत्र"),
    department: L("Bhopal Municipal Corporation", "भोपाल नगर निगम"),
    language_support: ["en", "hi"],
    eligibility: [
      L("The birth took place within Bhopal Municipal Corporation limits.", "जन्म भोपाल नगर निगम सीमा के भीतर हुआ हो।"),
      L("Registration within 21 days is free; later registration needs an affidavit.", "21 दिन में पंजीकरण निःशुल्क; देर से पंजीकरण पर शपथ पत्र आवश्यक।"),
    ],
    fee: L("Free within 21 days, then ₹10 + late fee", "21 दिन तक निःशुल्क, उसके बाद ₹10 + विलंब शुल्क"),
    processing_time: L("3–7 working days", "3–7 कार्य दिवस"),
    online_available: true,
    physical_visit_required: false,
    official_sources: [
      { url: "https://www.bhopalmunicipal.com/", title: "Bhopal Municipal Corporation", accessed_at: "2026-08-02" },
      { url: "https://crsorgi.gov.in/", title: "Civil Registration System (Govt. of India)", accessed_at: "2026-08-02" },
    ],
    requirements: [
      {
        name: L("Hospital discharge summary", "अस्पताल डिस्चार्ज सारांश"),
        required: true,
        explanation: L(
          "Proof of the birth event, with date, time and hospital name.",
          "जन्म का प्रमाण, जिसमें तिथि, समय और अस्पताल का नाम हो।",
        ),
      },
      {
        name: L("Parents' Aadhaar", "माता-पिता का आधार"),
        required: true,
        explanation: L("Both parents' Aadhaar are needed to record names on the certificate.", "प्रमाण पत्र पर नाम दर्ज करने के लिए माता-पिता दोनों के आधार आवश्यक हैं।"),
      },
      {
        name: L("Affidavit for late registration", "विलंब पंजीकरण हेतु शपथ पत्र"),
        required: false,
        explanation: L("Only if you are registering more than 21 days after the birth.", "केवल तब जब जन्म के 21 दिन बाद पंजीकरण कर रहे हों।"),
      },
    ],
    steps: [
      {
        number: 1,
        title: L("Open the CRS birth registration portal", "सीआरएस जन्म पंजीकरण पोर्टल खोलें"),
        instruction: L(
          'Go to crsorgi.gov.in and click "General Public Signup" to create a login for your district.',
          'crsorgi.gov.in पर जाएँ और अपने ज़िले के लिए लॉगिन बनाने हेतु "General Public Signup" पर क्लिक करें।',
        ),
        visual: {
          type: "official_screenshot",
          asset: "/guides/portal-home.svg",
          highlight: { label: L("General Public Signup", "जनरल पब्लिक साइनअप"), box: [70, 8, 26, 12] },
        },
      },
      {
        number: 2,
        title: L("Enter the birth details", "जन्म का विवरण भरें"),
        instruction: L(
          "Fill the child's name, date and place of birth exactly as printed on the hospital discharge summary.",
          "बच्चे का नाम, जन्म तिथि और स्थान अस्पताल के डिस्चार्ज सारांश के अनुसार भरें।",
        ),
        tip: L(
          "If the child's name is not decided yet, you can register without it and add it later.",
          "यदि बच्चे का नाम तय नहीं है, तो बिना नाम पंजीकरण कर बाद में जोड़ सकते हैं।",
        ),
        visual: {
          type: "simulated",
          asset: "/guides/form-fields.svg",
          highlight: { label: L("Date of birth", "जन्म तिथि"), box: [10, 40, 50, 12] },
        },
      },
      {
        number: 3,
        title: L("Upload the discharge summary", "डिस्चार्ज सारांश अपलोड करें"),
        instruction: L(
          "Attach a scan of the hospital discharge summary and both parents' Aadhaar.",
          "अस्पताल के डिस्चार्ज सारांश और माता-पिता दोनों के आधार की स्कैन कॉपी लगाएँ।",
        ),
        visual: {
          type: "official_screenshot",
          asset: "/guides/upload-docs.svg",
          highlight: { label: L("Choose file", "फ़ाइल चुनें"), box: [60, 40, 30, 12] },
        },
      },
      {
        number: 4,
        title: L("Submit and track", "जमा करें और स्थिति देखें"),
        instruction: L(
          "Submit the form and note the registration number. Download the certificate from the same portal once approved.",
          "फॉर्म जमा करें और पंजीकरण क्रमांक नोट करें। स्वीकृति के बाद उसी पोर्टल से प्रमाण पत्र डाउनलोड करें।",
        ),
        visual: {
          type: "official_screenshot",
          asset: "/guides/payment.svg",
          highlight: { label: L("Registration number", "पंजीकरण क्रमांक"), box: [12, 62, 45, 12] },
        },
      },
    ],
    common_mistakes: [
      L(
        "Spelling the child's name differently from the hospital record — corrections need a separate application.",
        "बच्चे का नाम अस्पताल के रिकॉर्ड से भिन्न लिखना — सुधार के लिए अलग आवेदन लगता है।",
      ),
      L("Missing the 21-day free window and not carrying an affidavit.", "21 दिन की निःशुल्क अवधि चूक जाना और शपथ पत्र न लाना।"),
    ],
    faqs: [
      {
        q: L("Can I register a birth that happened years ago?", "क्या वर्षों पहले हुए जन्म का पंजीकरण हो सकता है?"),
        a: L("Yes, but it needs a magistrate-attested affidavit and takes longer.", "हाँ, लेकिन मजिस्ट्रेट से सत्यापित शपथ पत्र आवश्यक है और समय अधिक लगता है।"),
      },
    ],
    verification: { status: "stale", last_checked: "2026-06-11" },
    queue_id: "q-bmc-zone1",
    published: true,
  },
];

export const LOCATIONS: Location[] = [
  {
    id: "loc-tehsil-huzur",
    name: L("Tehsil Office, Huzur", "तहसील कार्यालय, हुज़ूर"),
    address: L("Bharat Talkies Road, Bhopal 462001", "भारत टॉकीज़ रोड, भोपाल 462001"),
    service_slugs: ["domicile-certificate", "income-certificate", "caste-certificate"],
  },
  {
    id: "loc-bmc-zone1",
    name: L("BMC Zone 1 Office", "नगर निगम ज़ोन 1 कार्यालय"),
    address: L("Shivaji Nagar, Bhopal 462016", "शिवाजी नगर, भोपाल 462016"),
    service_slugs: ["birth-certificate"],
  },
  {
    id: "loc-lok-seva-kendra",
    name: L("Lok Seva Kendra, New Market", "लोक सेवा केंद्र, न्यू मार्केट"),
    address: L("TT Nagar, Bhopal 462003", "टीटी नगर, भोपाल 462003"),
    service_slugs: ["domicile-certificate", "income-certificate", "caste-certificate", "birth-certificate"],
  },
];
