import { L, type FormTutorial } from "../types.ts";

export const TUTORIALS: FormTutorial[] = [
  {
    id: "domicile-certificate-tutorial",
    service_slug: "domicile-certificate",
    title: L("How to Fill Domicile Certificate Form", "मूल निवासी प्रमाण पत्र फॉर्म कैसे भरें"),
    category: L("Revenue & Certificates", "राजस्व एवं प्रमाण पत्र"),
    difficulty: "easy",
    estimated_time: L("6–8 minutes", "6–8 मिनट"),
    portal_name: L("MP e-District (mpedistrict.gov.in)", "एमपी ई-डिस्ट्रिक्ट (mpedistrict.gov.in)"),
    portal_url: "https://mpedistrict.gov.in",
    summary: L(
      "Complete visual guide with annotated screenshots showing exact field entries, Samagra ID integration, residence proof requirements, and payment slip download.",
      "स्क्रीनशॉट और फ़ील्ड-वार निर्देशों के साथ संपूर्ण विजुअल गाइड — समग्र आईडी, निवास प्रमाण और रसीद डाउनलोड करने का सही तरीका।",
    ),
    prerequisites: [
      L("9-digit Member Samagra ID (not 8-digit Family ID)", "9 अंकों की सदस्य समग्र आईडी (8 अंकों की परिवार आईडी नहीं)"),
      L("Aadhaar card with exact name spelling", "आधार कार्ड जिस पर नाम की स्पेलिंग सही हो"),
      L("Electricity bill / water bill / voter ID (< 200 KB PDF)", "बिजली बिल / पानी बिल / वोटर आईडी (< 200 KB PDF)"),
      L("Net banking / UPI for ₹30 portal fee", "₹30 पोर्टल शुल्क के लिए UPI या नेट बैंकिंग"),
    ],
    steps: [
      {
        step_number: 1,
        title: L("Citizen Registration & Login", "नागरिक पंजीकरण एवं लॉगिन"),
        description: L(
          "Open mpedistrict.gov.in and login using your Aadhaar-linked mobile number. New citizens must register first.",
          "mpedistrict.gov.in खोलें और आधार से जुड़े मोबाइल नंबर से लॉगिन करें। नए नागरिक पहले पंजीकरण करें।",
        ),
        screenshot_type: "official_screenshot",
        screenshot_asset: "/guides/portal-signup-mock.svg",
        hotspots: [
          {
            id: "full-name",
            field_name: L("Full Name (as on Aadhaar)", "पूरा नाम (आधार के अनुसार)"),
            badge_number: 1,
            position: { x: 7.7, y: 40.5, w: 40.0, h: 6.5 },
            sample_value: "RAHUL VERMA",
            what_to_enter: L(
              "Type your legal name in CAPITAL letters exactly as printed on your Aadhaar card.",
              "अपना नाम अंग्रेजी के बड़े अक्षरों में ठीक वैसे लिखें जैसा आधार कार्ड पर मुद्रित है।",
            ),
            pro_tip: L(
              "Do not use abbreviations like 'R. Verma' if your Aadhaar has 'Rahul Verma'.",
              "यदि आधार पर 'Rahul Verma' है तो 'R. Verma' जैसा संक्षिप्त नाम न लिखें।",
            ),
            common_mistake: L(
              "Spelling differences between Aadhaar and school documents cause 40% of portal rejections.",
              "आधार और स्कूल रिकॉर्ड में नाम भिन्न होना 40% मामलों में फॉर्म रिजेक्ट होने का कारण बनता है।",
            ),
            required: true,
            input_type: "text",
          },
          {
            id: "mobile-otp",
            field_name: L("Aadhaar-Linked Mobile", "आधार से जुड़ा मोबाइल"),
            badge_number: 2,
            position: { x: 52.2, y: 40.5, w: 40.0, h: 6.5 },
            sample_value: "9876543210",
            what_to_enter: L(
              "Enter your active 10-digit mobile number to receive the government one-time password (OTP).",
              "सरकारी वन-टाइम पासवर्ड (OTP) प्राप्त करने के लिए अपना सक्रिय 10 अंकों का मोबाइल नंबर दर्ज करें।",
            ),
            pro_tip: L(
              "Keep the phone nearby — OTP expires within 3 minutes.",
              "फ़ोन पास रखें — OTP 3 मिनट में समाप्त हो जाता है।",
            ),
            common_mistake: L(
              "Entering a different family member's unlinked mobile number.",
              "परिवार के किसी अन्य सदस्य का असंबद्ध मोबाइल नंबर दर्ज करना।",
            ),
            required: true,
            input_type: "number",
          },
          {
            id: "otp-verify",
            field_name: L("6-Digit OTP Verification", "6-अंकीय OTP सत्यापन"),
            badge_number: 3,
            position: { x: 52.2, y: 54.3, w: 40.0, h: 6.5 },
            sample_value: "482910",
            what_to_enter: L(
              "Enter the 6-digit numeric OTP sent by MPGOVT SMS and click 'Verify OTP'.",
              "MPGOVT SMS द्वारा भेजा गया 6 अंकों का OTP दर्ज करें और 'Verify OTP' पर क्लिक करें।",
            ),
            required: true,
            input_type: "number",
          },
        ],
        checklist: [
          L("Phone is within mobile signal coverage", "फ़ोन में नेटवर्क उपलब्ध है"),
          L("Aadhaar is linked with active mobile number", "आधार में मोबाइल नंबर जुड़ा हुआ है"),
        ],
      },
      {
        step_number: 2,
        title: L("Filling Application Details & Samagra Link", "आवेदन विवरण एवं समग्र लिंक भरना"),
        description: L(
          "Enter your 9-digit Member Samagra ID, continuous years of residence, and permanent residential address in Bhopal.",
          "अपनी 9 अंकों की सदस्य समग्र आईडी, भोपाल में निवास के वर्ष और स्थायी पता दर्ज करें।",
        ),
        screenshot_type: "simulated",
        screenshot_asset: "/guides/domicile-form-mock.svg",
        hotspots: [
          {
            id: "app-name",
            field_name: L("Applicant Full Name", "आवेदक का पूरा नाम"),
            badge_number: 1,
            position: { x: 6.6, y: 32.9, w: 40.5, h: 5.5 },
            sample_value: "RAHUL VERMA",
            what_to_enter: L(
              "Enter applicant's full name in English. The Hindi transliteration will auto-generate.",
              "आवेदक का पूरा नाम अंग्रेजी में भरें। हिंदी नाम स्वतः उत्पन्न हो जाएगा।",
            ),
            pro_tip: L(
              "Check that the generated Hindi spelling matches your local official papers.",
              "जाँचें कि स्वतः बनी हिंदी स्पेलिंग आपके स्थानीय दस्तावेज़ों से मेल खाती है।",
            ),
            required: true,
            input_type: "text",
          },
          {
            id: "father-name",
            field_name: L("Father's Name", "पिता का नाम"),
            badge_number: 2,
            position: { x: 50.5, y: 32.9, w: 42.7, h: 5.5 },
            sample_value: "SURESH VERMA",
            what_to_enter: L(
              "Enter father's name as printed on his Aadhaar/Voter ID without prefixes like 'Shri' or 'Mr.'",
              "पिता का नाम बिना 'श्री' या 'मिस्टर' लगाए आधार/वोटर कार्ड के अनुसार भरें।",
            ),
            required: true,
            input_type: "text",
          },
          {
            id: "samagra-id",
            field_name: L("9-Digit Samagra Member ID", "9 अंकों की सदस्य समग्र आईडी"),
            badge_number: 3,
            position: { x: 6.6, y: 43.2, w: 26.6, h: 5.5 },
            sample_value: "194829104",
            what_to_enter: L(
              "Enter the 9-digit Member ID (सदस्य आईडी), NOT the 8-digit Family ID (परिवार आईडी).",
              "9 अंकों की सदस्य आईडी दर्ज करें, 8 अंकों की परिवार आईडी नहीं।",
            ),
            pro_tip: L(
              "Click 'Fetch Samagra' to auto-pull your age, father's name, and registered address.",
              "'Fetch Samagra' पर क्लिक करें जिससे उम्र, पिता का नाम और पता स्वतः लोड हो जाए।",
            ),
            common_mistake: L(
              "Entering 8-digit Family ID triggers a red validation error 'Member not found'.",
              "8 अंकों की परिवार आईडी डालने पर 'Member not found' की त्रुटि आती है।",
            ),
            required: true,
            input_type: "number",
          },
          {
            id: "perm-address",
            field_name: L("Permanent Address", "स्थायी पता"),
            badge_number: 4,
            position: { x: 6.6, y: 59.0, w: 53.3, h: 8.7 },
            sample_value: "H.No 45, Near Hanuman Temple, Shivaji Nagar, Bhopal - 462016",
            what_to_enter: L(
              "Enter your house number, landmark, locality, and PIN code matching your electricity bill.",
              "मकान नंबर, लैंडमार्क, मोहल्ला और पिन कोड बिजली बिल के अनुसार दर्ज करें।",
            ),
            required: true,
            input_type: "text",
          },
          {
            id: "years-stay",
            field_name: L("Continuous Years in MP", "म.प्र. में निरंतर निवास वर्ष"),
            badge_number: 5,
            position: { x: 62.2, y: 59.0, w: 31.1, h: 5.5 },
            sample_value: "15",
            what_to_enter: L(
              "Enter the total number of continuous years you or your family have lived in Madhya Pradesh (min. 10 years).",
              "मध्य प्रदेश में आपके या आपके परिवार के निरंतर निवास के कुल वर्ष दर्ज करें (न्यूनतम 10 वर्ष)।",
            ),
            required: true,
            input_type: "number",
          },
        ],
        checklist: [
          L("Samagra details matched with Aadhaar", "समग्र विवरण आधार से मेल खा रहा है"),
          L("PIN code is 6 digits (Bhopal: 462001 - 462044)", "पिन कोड 6 अंकों का है (भोपाल: 462001 - 462044)"),
        ],
      },
      {
        step_number: 3,
        title: L("Uploading Proofs & Submitting Application", "दस्तावेज़ अपलोड एवं आवेदन जमा करना"),
        description: L(
          "Attach scanned copies of Aadhaar, residence proof, and self-declaration form under 200 KB per document.",
          "आधार, निवास प्रमाण और स्व-घोषणा पत्र की स्कैन प्रतियां (प्रत्येक 200 KB से कम) संलग्न करें।",
        ),
        screenshot_type: "official_screenshot",
        screenshot_asset: "/guides/upload-docs.svg",
        hotspots: [
          {
            id: "upload-residence",
            field_name: L("Upload Residence Proof", "निवास प्रमाण अपलोड करें"),
            badge_number: 1,
            position: { x: 60.0, y: 40.0, w: 30.0, h: 12.0 },
            sample_value: "residence_proof_scan.pdf",
            what_to_enter: L(
              "Select a single clear PDF containing your electricity bill, voter ID, or registry copy.",
              "बिजली बिल, वोटर आईडी या रजिस्ट्री की साफ़ PDF फ़ाइल चुनें।",
            ),
            pro_tip: L(
              "Ensure document resolution is between 150-200 DPI for crystal clear text under 200 KB.",
              "दस्तावेज़ का रेज़ोल्यूशन 150-200 DPI रखें ताकि 200 KB में भी अक्षर साफ़ दिखें।",
            ),
            common_mistake: L(
              "Uploading camera phone photo taken at an angle where dates/numbers are blurred.",
              "तिरछी फ़ोटो अपलोड करना जिससे तारीख या संख्या धुंधली हो जाती है।",
            ),
            required: true,
            input_type: "file",
          },
        ],
        checklist: [
          L("All PDF files are under 200 KB", "सभी PDF फ़ाइलें 200 KB से छोटी हैं"),
          L("Document text and stamp are clearly legible", "दस्तावेज़ का पाठ और सील स्पष्ट रूप से पढ़ने योग्य हैं"),
        ],
      },
      {
        step_number: 4,
        title: L("Fee Payment & Acknowledgment Slip", "शुल्क भुगतान एवं पावती रसीद"),
        description: L(
          "Pay the ₹30 fee via UPI/Net Banking and immediately save the RS/XXXX application number.",
          "UPI/नेट बैंकिंग से ₹30 का भुगतान करें और तत्काल RS/XXXX आवेदन क्रमांक सहेजें।",
        ),
        screenshot_type: "official_screenshot",
        screenshot_asset: "/guides/payment.svg",
        hotspots: [
          {
            id: "ref-number",
            field_name: L("Application Reference Number", "आवेदन संदर्भ संख्या"),
            badge_number: 1,
            position: { x: 12.0, y: 62.0, w: 45.0, h: 12.0 },
            sample_value: "RS/BPL/2026/84920",
            what_to_enter: L(
              "Copy and note this unique reference number. You will need it to track status on Queueless or the MP portal.",
              "इस अद्वितीय संदर्भ संख्या को नोट कर लें। क्यूलेस या एमपी पोर्टल पर स्थिति देखने के लिए इसकी आवश्यकता होगी।",
            ),
            pro_tip: L(
              "Take a screenshot of the payment receipt screen before closing the browser tab.",
              "ब्राउज़र टैब बंद करने से पहले भुगतान रसीद का स्क्रीनशॉट ले लें।",
            ),
            required: true,
            input_type: "text",
          },
        ],
      },
    ],
    common_rejections: [
      {
        reason: L("Name spelling mismatch between Aadhaar and Residence Proof", "आधार और निवास प्रमाण में नाम की स्पेलिंग में अंतर"),
        prevention: L(
          "Ensure the exact name in your application matches both documents letter-by-letter.",
          "सुनिश्चित करें कि आवेदन में दर्ज नाम दोनों दस्तावेज़ों से अक्षरशः मेल खाता हो।",
        ),
      },
      {
        reason: L("File size greater than 200 KB or blurred scan", "फ़ाइल 200 KB से बड़ी या धुंधली स्कैन कॉपी"),
        prevention: L(
          "Use a free document scanner app with high contrast and compress to 150 KB PDF.",
          "दस्तावेज़ स्कैनर ऐप से साफ़ स्कैन करें और 150 KB की PDF में संपीड़ित करें।",
        ),
      },
      {
        reason: L("Entered 8-digit Family Samagra ID instead of 9-digit Member ID", "9-अंकीय सदस्य आईडी के स्थान पर 8-अंकीय परिवार आईडी भरना"),
        prevention: L(
          "Find your 9-digit Member ID on samagra.gov.in before opening the application form.",
          "फॉर्म खोलने से पहले samagra.gov.in पर अपनी 9 अंकों की व्यक्तिगत सदस्य आईडी खोजें।",
        ),
      },
    ],
  },
  {
    id: "income-certificate-tutorial",
    service_slug: "income-certificate",
    title: L("How to Fill Income Certificate Form", "आय प्रमाण पत्र फॉर्म कैसे भरें"),
    category: L("Revenue & Certificates", "राजस्व एवं प्रमाण पत्र"),
    difficulty: "medium",
    estimated_time: L("5–7 minutes", "5–7 मिनट"),
    portal_name: L("MP e-District (mpedistrict.gov.in)", "एमपी ई-डिस्ट्रिक्ट (mpedistrict.gov.in)"),
    portal_url: "https://mpedistrict.gov.in",
    summary: L(
      "Detailed visual walkthrough for annual family income assessment, listing dependents, salary slip submission, and self-declaration affidavit.",
      "वार्षिक पारिवारिक आय आकलन, आश्रितों की सूची, वेतन पर्ची और स्व-घोषणा पत्र भरने का संपूर्ण सचित्र मार्गदर्शन।",
    ),
    prerequisites: [
      L("Salary slips (last 3 months) or notarized self-declaration", "पिछले 3 माह की वेतन पर्ची या स्व-घोषणा पत्र"),
      L("Samagra Family ID showing all co-habiting members", "समग्र परिवार आईडी जिसमें सभी सदस्य शामिल हों"),
      L("Aadhaar card of applicant and earning head", "आवेदक एवं मुख्य आय अर्जक का आधार कार्ड"),
      L("Ration card / BPL card (if applicable for fee concession)", "राशन कार्ड / बीपीएल कार्ड (यदि लागू हो)"),
    ],
    steps: [
      {
        step_number: 1,
        title: L("Family Income Declaration Section", "पारिवारिक आय घोषणा अनुभाग"),
        description: L(
          "Enter the total annual earnings from all family members combined, select primary livelihood source, and specify purpose.",
          "परिवार के सभी सदस्यों की कुल वार्षिक आय, आजीविका का मुख्य साधन और प्रमाण पत्र का उद्देश्य चुनें।",
        ),
        screenshot_type: "simulated",
        screenshot_asset: "/guides/income-form-mock.svg",
        hotspots: [
          {
            id: "annual-income",
            field_name: L("Total Annual Family Income (in ₹)", "सकल पारिवारिक वार्षिक आय (₹ में)"),
            badge_number: 1,
            position: { x: 6.6, y: 32.9, w: 40.5, h: 5.5 },
            sample_value: "120000",
            what_to_enter: L(
              "Enter total annual earnings in Rupees (e.g. 120000). Must include salary, business, agriculture, and rent.",
              "रुपयों में कुल वार्षिक आय दर्ज करें (जैसे 120000)। इसमें वेतन, व्यवसाय, कृषि और किराया शामिल होना चाहिए।",
            ),
            pro_tip: L(
              "Do not just enter your individual student pocket money; government calculates total household income.",
              "केवल अपनी व्यक्तिगत छात्र जेबखर्च न भरें; सरकार पूरे परिवार की कुल आय की गणना करती है।",
            ),
            common_mistake: L(
              "Entering a figure that contradicts an earlier certificate issued within the same financial year.",
              "उसी वित्तीय वर्ष में पहले जारी प्रमाण पत्र की आय से विरोधाभासी राशि दर्ज करना।",
            ),
            required: true,
            input_type: "number",
          },
          {
            id: "livelihood-source",
            field_name: L("Primary Livelihood Source", "आजीविका का मुख्य साधन"),
            badge_number: 2,
            position: { x: 50.5, y: 32.9, w: 42.7, h: 5.5 },
            sample_value: "Private Employee",
            what_to_enter: L(
              "Select your family's primary occupation: Agriculture, Salaried, Self-Employed, Daily Wage, or Business.",
              "परिवार का मुख्य व्यवसाय चुनें: कृषि, नौकरीपेशा, स्वरोज़गार, दैनिक वेतनभोगी या व्यापार।",
            ),
            required: true,
            input_type: "select",
            options: [
              L("Salaried / Private Sector", "नौकरीपेशा / निजी क्षेत्र"),
              L("Daily Wage / Labor", "दैनिक मजदूरी / श्रमिक"),
              L("Agriculture / Farming", "कृषि / खेती"),
              L("Self-Employed / Shop", "स्वरोज़गार / दुकान"),
            ],
          },
          {
            id: "purpose-cert",
            field_name: L("Purpose of Certificate", "प्रमाण पत्र का प्रयोजन"),
            badge_number: 3,
            position: { x: 50.5, y: 43.2, w: 42.7, h: 5.5 },
            sample_value: "Scholarship & Higher Education Admission",
            what_to_enter: L(
              "Specify where you need to submit this certificate (e.g. Medhavi Chhatra Yojana, College Admission, Ration Card).",
              "निर्दिष्ट करें कि आपको यह प्रमाण पत्र कहाँ जमा करना है (उदा. मेधावी छात्र योजना, कॉलेज प्रवेश)।",
            ),
            required: true,
            input_type: "text",
          },
        ],
        checklist: [
          L("Total income matches bank statements / salary slip", "कुल आय बैंक स्टेटमेंट या वेतन पर्ची से मेल खाती है"),
          L("All dependent family members are declared", "परिवार के सभी आश्रित सदस्य घोषित हैं"),
        ],
      },
    ],
    common_rejections: [
      {
        reason: L("Declaring only student income (₹0) instead of parents' total earnings", "माता-पिता की कुल कमाई के बजाय केवल छात्र की आय (₹0) लिखना"),
        prevention: L(
          "Always declare the cumulative annual income of all working family members residing together.",
          "एक साथ रहने वाले सभी कामकाजी पारिवारिक सदस्यों की संचयी वार्षिक आय दर्ज करें।",
        ),
      },
      {
        reason: L("Missing self-declaration signature or unverified salary slip", "स्व-घोषणा पत्र पर हस्ताक्षर न होना या अप्रमाणित वेतन पर्ची"),
        prevention: L(
          "Download the official self-declaration format, sign it with date, and upload a clear scan.",
          "आधिकारिक स्व-घोषणा प्रारूप डाउनलोड करें, तारीख सहित हस्ताक्षर करें और साफ़ स्कैन अपलोड करें।",
        ),
      },
    ],
  },
  {
    id: "caste-certificate-tutorial",
    service_slug: "caste-certificate",
    title: L("How to Fill Caste Certificate (SC/ST/OBC) Form", "जाति प्रमाण पत्र (SC/ST/OBC) फॉर्म कैसे भरें"),
    category: L("Revenue & Social Welfare", "राजस्व एवं समाज कल्याण"),
    difficulty: "hard",
    estimated_time: L("8–12 minutes", "8–12 मिनट"),
    portal_name: L("MP e-District (mpedistrict.gov.in)", "एमपी ई-डिस्ट्रिक्ट (mpedistrict.gov.in)"),
    portal_url: "https://mpedistrict.gov.in",
    summary: L(
      "Comprehensive walkthrough for caste lineage verification, locating sub-caste serial numbers in state gazette, paternal lineage proof, and tehsil record matching.",
      "जाति वंशावली सत्यापन, राज्य गजट में उप-जाति क्रमांक खोजना, पितृ पक्ष दस्तावेज़ और तहसील रिकॉर्ड मिलान का संपूर्ण मार्गदर्शन।",
    ),
    prerequisites: [
      L("Father's / Paternal Uncle's / Grandfather's existing caste certificate", "पिता / चाचा / दादाजी का पुराना जाति प्रमाण पत्र"),
      L("Pre-1950 (for SC/ST) or pre-1984 (for OBC) land/school record in MP", "मध्य प्रदेश में 1950 पूर्व (SC/ST) या 1984 पूर्व (OBC) का भूमि/स्कूल रिकॉर्ड"),
      L("Applicant's Samagra ID and Aadhaar card", "आवेदक की समग्र आईडी और आधार कार्ड"),
    ],
    steps: [
      {
        step_number: 1,
        title: L("Caste Category & Paternal Lineage Selection", "जाति श्रेणी एवं पितृ पक्ष वंशावली चयन"),
        description: L(
          "Select the exact notified caste from the state gazette dropdown and input father's ancestral details.",
          "राज्य गजट सूची से सटीक अधिसूचित जाति चुनें और पिता के पैतृक विवरण दर्ज करें।",
        ),
        screenshot_type: "simulated",
        screenshot_asset: "/guides/caste-form-mock.svg",
        hotspots: [
          {
            id: "caste-cat",
            field_name: L("Caste Category (SC/ST/OBC)", "जाति श्रेणी (SC/ST/OBC)"),
            badge_number: 1,
            position: { x: 6.6, y: 32.9, w: 40.5, h: 5.5 },
            sample_value: "OBC",
            what_to_enter: L(
              "Select your constitutional category. Make sure it matches your state list.",
              "अपनी संवैधानिक श्रेणी चुनें। सुनिश्चित करें कि यह राज्य सूची के अनुसार है।",
            ),
            required: true,
            input_type: "select",
            options: [
              L("OBC (Other Backward Class)", "ओबीसी (अन्य पिछड़ा वर्ग)"),
              L("SC (Scheduled Caste)", "अनुसूचित जाति (अ.जा.)"),
              L("ST (Scheduled Tribe)", "अनुसूचित जनजाति (अ.ज.जा.)"),
            ],
          },
          {
            id: "sub-caste",
            field_name: L("Notified Sub-Caste Name & Serial", "अधिसूचित उप-जाति नाम व क्रमांक"),
            badge_number: 2,
            position: { x: 50.5, y: 32.9, w: 42.7, h: 5.5 },
            sample_value: "Kushwaha / Kachhi (Serial 42)",
            what_to_enter: L(
              "Select the exact sub-caste name as notified in MP Government Gazette.",
              "मध्य प्रदेश शासन के गजट में अधिसूचित सटीक उप-जाति का चयन करें।",
            ),
            pro_tip: L(
              "Do not type colloquial community titles (e.g. write 'Kushwaha', not just localized slang).",
              "स्थानीय उपनामों के बजाय सरकारी गजट में उल्लिखित मूल जाति नाम चुनें।",
            ),
            required: true,
            input_type: "text",
          },
          {
            id: "relative-cert",
            field_name: L("Father's Certificate Number", "पिता का जाति प्रमाण पत्र क्रमांक"),
            badge_number: 3,
            position: { x: 6.6, y: 43.2, w: 40.5, h: 5.5 },
            sample_value: "RS/BPL/2014/99410",
            what_to_enter: L(
              "Enter the digital certificate number of your father or paternal brother to fast-track verification without home inquiry.",
              "घर पर जांच से बचने और त्वरित सत्यापन हेतु पिता या सगे भाई का डिजिटल प्रमाण पत्र क्रमांक दर्ज करें।",
            ),
            required: false,
            input_type: "text",
          },
        ],
        checklist: [
          L("Lineage documents belong strictly to paternal side (father's family)", "दस्तावेज़ केवल पितृ पक्ष (पिता के परिवार) के हैं"),
          L("Sub-caste is listed in Madhya Pradesh state gazette", "उप-जाति मध्य प्रदेश राज्य गजट सूची में शामिल है"),
        ],
      },
    ],
    common_rejections: [
      {
        reason: L("Submitting mother's caste certificate (maternal lineage)", "माता का जाति प्रमाण पत्र संलग्न करना (मातृ पक्ष)"),
        prevention: L(
          "Under Indian law, caste status is strictly derived from the father. Always provide paternal documents.",
          "भारतीय कानून के अनुसार जाति केवल पिता से मिलती है। सदैव पिता या चाचा का प्रमाण पत्र ही लगाएं।",
        ),
      },
      {
        reason: L("Applying for Central OBC format when applying for state benefits", "राज्य सेवाओं के लिए केंद्र प्रारूप में आवेदन करना"),
        prevention: L(
          "Choose the Madhya Pradesh State e-District form for local college reservations and jobs.",
          "स्थानीय कॉलेज आरक्षण व नौकरियों के लिए एमपी स्टेट ई-डिस्ट्रिक्ट फॉर्म चुनें।",
        ),
      },
    ],
  },
  {
    id: "birth-certificate-tutorial",
    service_slug: "birth-certificate",
    title: L("How to Register Birth & Download Certificate", "जन्म पंजीयन एवं प्रमाण पत्र फॉर्म कैसे भरें"),
    category: L("Municipal & Civil Registration", "नगर निगम एवं जन्म पंजीयन"),
    difficulty: "easy",
    estimated_time: L("4–6 minutes", "4–6 मिनट"),
    portal_name: L("CRS Portal (crsorgi.gov.in)", "सीआरएस पोर्टल (crsorgi.gov.in)"),
    portal_url: "https://crsorgi.gov.in",
    summary: L(
      "Step-by-step CRS guide for registering institutional/home births within 21 days, hospital discharge slip verification, parents' Aadhaar matching, and certificate download.",
      "21 दिनों में अस्पताल/घर पर हुए जन्म का निःशुल्क पंजीयन, डिस्चार्ज स्लिप अपलोड और माता-पिता के आधार मिलान का विजुअल गाइड।",
    ),
    prerequisites: [
      L("Hospital discharge summary / birth slip from registered hospital in Bhopal", "भोपाल के पंजीकृत अस्पताल की डिस्चार्ज समरी / जन्म पर्ची"),
      L("Both mother's and father's Aadhaar cards", "माता और पिता दोनों के आधार कार्ड"),
      L("Marriage certificate or joint residence proof (if hospital records vary)", "विवाह प्रमाण पत्र या संयुक्त निवास प्रमाण"),
    ],
    steps: [
      {
        step_number: 1,
        title: L("Child & Hospital Birth Reporting Form", "शिशु एवं अस्पताल जन्म रिपोर्टिंग फॉर्म"),
        description: L(
          "Fill exact date and time of birth as stamped on the hospital discharge slip, and parents' details.",
          "अस्पताल की डिस्चार्ज पर्ची पर अंकित सही जन्म तिथि, समय और माता-पिता का विवरण भरें।",
        ),
        screenshot_type: "official_screenshot",
        screenshot_asset: "/guides/birth-form-mock.svg",
        hotspots: [
          {
            id: "dob-field",
            field_name: L("Date of Birth (DD/MM/YYYY)", "जन्म तिथि (दिनांक/माह/वर्ष)"),
            badge_number: 1,
            position: { x: 6.6, y: 32.9, w: 25.5, h: 5.5 },
            sample_value: "14/08/2026",
            what_to_enter: L(
              "Select the exact date of birth. If applying within 21 days, the portal charges ₹0 fee.",
              "सटीक जन्म तिथि चुनें। 21 दिनों के भीतर आवेदन करने पर पोर्टल ₹0 शुल्क लेता है।",
            ),
            pro_tip: L(
              "Register before the 21st day to avoid notary affidavit and executive magistrate fees.",
              "21वें दिन से पहले पंजीयन करें ताकि नोटरी शपथ पत्र और मजिस्ट्रेट शुल्क से बचा जा सके।",
            ),
            required: true,
            input_type: "date",
          },
          {
            id: "child-name",
            field_name: L("Child Name (Optional at birth)", "बच्चे का नाम (जन्म के समय वैकल्पिक)"),
            badge_number: 2,
            position: { x: 56.6, y: 32.9, w: 36.6, h: 5.5 },
            sample_value: "AARADHYA VERMA",
            what_to_enter: L(
              "If name is finalized, type in English. If naming ceremony is pending, you can leave it blank and add it later free within 1 year.",
              "यदि नाम तय है तो अंग्रेजी में भरें। यदि नामकरण शेष है तो इसे खाली छोड़ सकते हैं और 1 वर्ष में निःशुल्क जोड़ सकते हैं।",
            ),
            required: false,
            input_type: "text",
          },
          {
            id: "mother-name",
            field_name: L("Mother's Full Name (as on Aadhaar)", "माता का पूरा नाम (आधार अनुसार)"),
            badge_number: 3,
            position: { x: 50.5, y: 43.2, w: 42.7, h: 5.5 },
            sample_value: "PRIYA VERMA",
            what_to_enter: L(
              "Enter mother's name exactly as on her Aadhaar. Any change after issuance requires court gazette publication.",
              "माता का नाम आधार के अनुसार भरें। जारी होने के बाद सुधार के लिए कोर्ट गजट प्रकाशन लगता है।",
            ),
            required: true,
            input_type: "text",
          },
        ],
        checklist: [
          L("Hospital name matches BMC Zone jurisdiction", "अस्पताल का नाम नगर निगम ज़ोन सीमा में है"),
          L("Date of birth matches hospital discharge certificate", "जन्म तिथि अस्पताल डिस्चार्ज पर्ची से मेल खाती है"),
        ],
      },
    ],
    common_rejections: [
      {
        reason: L("Spelling mismatch in mother's or father's name compared to hospital discharge slip", "माता या पिता के नाम की स्पेलिंग अस्पताल पर्ची से भिन्न होना"),
        prevention: L(
          "If the hospital entered an incorrect spelling on the discharge slip, get the hospital correction letter first.",
          "यदि अस्पताल ने डिस्चार्ज पर्ची पर गलत स्पेलिंग लिखी है तो पहले अस्पताल से शुद्धि पत्र प्राप्त करें।",
        ),
      },
      {
        reason: L("Missing the 21-day timeline without attaching late registration affidavit", "21 दिन की समय सीमा बीतने के बाद बिना शपथ पत्र आवेदन करना"),
        prevention: L(
          "Apply within 21 days of birth, or get an SDM/Magistrate delayed registration order if older.",
          "जन्म के 21 दिन के भीतर आवेदन करें, या देर होने पर एसडीएम/मजिस्ट्रेट का विलंब आदेश संलग्न करें।",
        ),
      },
    ],
  },
];
