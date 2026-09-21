export type Language = 'en' | 'hi' | 'mr' | 'gu';

export interface Translations {
  welcome: {
    overlay1: string;
    overlay2: string;
    overlay3: string;
    overlay4: string;
    tagline: string;
    desc: string;
    getStarted: string;
    alreadyHaveAccount: string;
    logIn: string;
    caption: string;
    value1Title: string;
    value1Desc: string;
    value2Title: string;
    value2Desc: string;
    value3Title: string;
    value3Desc: string;
    tapToExpand: string;
    tapToCollapse: string;
  };
  intro: {
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: string;
    step3Desc: string;
    skip: string;
    next: string;
    continue: string;
  };
  login: {
    title: string;
    subtitle: string;
    employeeId: string;
    employeeIdPlaceholder: string;
    pin: string;
    signIn: string;
    signingIn: string;
    sso: string;
    forgotPin: string;
    requestAccess: string;
    demoAccounts: string;
    lockedMsg: (seconds: number) => string;
    wrongPin: (triesLeft: number) => string;
    unknownId: (id: string) => string;
  };
  demoSheet: {
    title: string;
    subtitle: string;
    footer: string;
  };
  forgotPinSheet: {
    step1Title: string;
    step1Desc: string;
    sendCode: string;
    step2Title: string;
    step2Desc: string;
    demoHint: string;
    verify: string;
    resendIn: (seconds: number) => string;
    resendNow: string;
    codeError: string;
    step3Title: string;
    step3Desc: string;
    newPin: string;
    confirmPin: string;
    savePin: string;
    pinMismatch: string;
    successTitle: string;
    successDesc: string;
    backToLogin: string;
  };
  requestAccess: {
    title: string;
    subtitle: string;
    fullName: string;
    contact: string;
    contractor: string;
    project: string;
    role: string;
    submit: string;
    submitting: string;
    successTitle: string;
    refNumber: string;
    successDesc: string;
    backToLogin: string;
  };
  projectPicker: {
    title: string;
    subtitle: string;
    activeProjects: string;
  };
  permissions: {
    title: string;
    subtitle: string;
    micTitle: string;
    micDesc: string;
    notifTitle: string;
    notifDesc: string;
    locTitle: string;
    locDesc: string;
    allow: string;
    allowed: string;
    notNow: string;
    continue: string;
    micDeniedWarning: string;
  };
  languageSheet: {
    title: string;
    subtitle: string;
    fallbackNotice: string;
  };
}

export const TRANSLATIONS: Record<Language, Translations> = {
  en: {
    welcome: {
      overlay1: 'From',
      overlay2: 'Sites to',
      overlay3: 'a Smarter',
      overlay4: 'Tomorrow',
      tagline: 'Turn field progress into schedule intelligence.',
      desc: 'Connect voice, field logs and Primavera P6 into one verified source of project truth.',
      getStarted: 'Get Started ›',
      alreadyHaveAccount: 'Already have an account? ',
      logIn: 'Log In',
      caption: 'Planning-to-Execution Intelligence',
      value1Title: 'Capture by voice in 15 seconds',
      value1Desc: 'Field supervisors speak updates in Hindi, English, or mixed dialects directly on site.',
      value2Title: 'Linked to the right P6 activity',
      value2Desc: 'Deterministic AI identifies WBS elements, physical spools, and quantities with confidence.',
      value3Title: 'Verified by your planner',
      value3Desc: 'Controls planners approve verified updates before touching the live project baseline.',
      tapToExpand: 'Tap or drag up to learn how it works',
      tapToCollapse: 'Tap or drag down to close',
    },
    intro: {
      step1Title: 'Speak your update',
      step1Desc: 'Hindi, English or a mix. Field supervisors report progress or delays in under 15 seconds.',
      step2Title: 'We link it to the schedule',
      step2Desc: 'Deterministic AI matches field spoken evidence to Primavera P6 WBS activities with confidence scores.',
      step3Title: 'Your planner verifies it',
      step3Desc: 'Your project controls planner verifies every match before the master schedule updates. No hallucinations.',
      skip: 'Skip',
      next: 'Next',
      continue: 'Continue to Login',
    },
    login: {
      title: 'Sign in to your project',
      subtitle: 'Use your employee ID and 6-digit PIN.',
      employeeId: 'Employee ID',
      employeeIdPlaceholder: 'e.g. SUP-0412',
      pin: '6-Digit PIN',
      signIn: 'Sign in',
      signingIn: 'Verifying...',
      sso: 'Continue with company SSO',
      forgotPin: 'Forgot PIN?',
      requestAccess: 'Request access',
      demoAccounts: 'Demo accounts',
      lockedMsg: (seconds) => `Too many failed attempts. Account locked for ${seconds}s.`,
      wrongPin: (triesLeft) => `PIN doesn't match this employee ID. ${triesLeft} ${triesLeft === 1 ? 'try' : 'tries'} left.`,
      unknownId: (id) => `No account found for ${id}. Check the ID or request access.`,
    },
    demoSheet: {
      title: 'Demo accounts',
      subtitle: 'Select any role to sign in immediately without a PIN',
      footer: 'Demo data is synthetic.',
    },
    forgotPinSheet: {
      step1Title: 'Forgot PIN',
      step1Desc: 'Enter your Employee ID to receive a 6-digit reset code.',
      sendCode: 'Send code',
      step2Title: 'Enter verification code',
      step2Desc: 'We sent a 6-digit code to your registered mobile number.',
      demoHint: 'Demo hint: use code 482913',
      verify: 'Verify code',
      resendIn: (seconds) => `Resend code in ${seconds}s`,
      resendNow: 'Resend code',
      codeError: 'Incorrect verification code. Please try again.',
      step3Title: 'Set new PIN',
      step3Desc: 'Create a new 6-digit PIN for your account.',
      newPin: 'New 6-Digit PIN',
      confirmPin: 'Confirm PIN',
      savePin: 'Save PIN',
      pinMismatch: 'PINs do not match. Please verify both fields.',
      successTitle: 'PIN reset successful',
      successDesc: 'Your PIN has been updated. You can now sign in with your new PIN.',
      backToLogin: 'Back to sign in',
    },
    requestAccess: {
      title: 'Request Project Access',
      subtitle: 'Ask an administrator for access to project controls.',
      fullName: 'Full name',
      contact: 'Employee ID or mobile',
      contractor: 'Contractor / Organisation',
      project: 'Project',
      role: 'Requested role',
      submit: 'Submit request',
      submitting: 'Submitting request...',
      successTitle: 'Request submitted',
      refNumber: 'REQ-0087',
      successDesc: 'Your request has been forwarded to the Project Admin. You will receive an SMS when approved.',
      backToLogin: 'Back to sign in',
    },
    projectPicker: {
      title: 'Select Project',
      subtitle: 'Choose an active pipeline or facility execution package',
      activeProjects: 'Active Projects',
    },
    permissions: {
      title: 'Enable Field Permissions',
      subtitle: 'SchedBridge AI requires microphone access for hands-free progress reporting.',
      micTitle: 'Microphone',
      micDesc: 'Required to record 15-second voice reports from the field.',
      notifTitle: 'Notifications',
      notifDesc: 'Get alerts when planners review or clarify your updates.',
      locTitle: 'Location',
      locDesc: 'Optional. Automatically tags reports with chainage / KP.',
      allow: 'Allow',
      allowed: 'Allowed ✓',
      notNow: 'Not now',
      continue: 'Continue to Project',
      micDeniedWarning: 'Microphone denied. Capture screen will default to typing.',
    },
    languageSheet: {
      title: 'Select Language',
      subtitle: 'Choose your preferred language for the interface',
      fallbackNotice: '',
    },
  },
  hi: {
    welcome: {
      overlay1: 'साइट से',
      overlay2: 'एक बेहतर',
      overlay3: 'और स्मार्ट',
      overlay4: 'कल की ओर',
      tagline: 'फील्ड प्रगति को शेड्यूल इंटेलिजेंस में बदलें।',
      desc: 'वॉयस, फील्ड लॉग और प्राइमावेरा P6 को प्रोजेक्ट की एक प्रमाणित सच्चाई में जोड़ें।',
      getStarted: 'शुरू करें ›',
      alreadyHaveAccount: 'क्या आपके पास पहले से खाता है? ',
      logIn: 'लॉग इन करें',
      caption: 'योजना से निष्पादन तक इंटेलिजेंस',
      value1Title: '15 सेकंड में वॉयस द्वारा रिपोर्ट करें',
      value1Desc: 'फील्ड सुपरवाइजर साइट पर सीधे हिंदी, अंग्रेजी या मिश्रित भाषा में अपडेट दे सकते हैं।',
      value2Title: 'सही P6 एक्टिविटी से जुड़ाव',
      value2Desc: 'सटीक AI विश्वसनीयता के साथ WBS तत्वों, फिजिकल स्पूल और मात्रा की पहचान करता है।',
      value3Title: 'प्लानर द्वारा सत्यापित',
      value3Desc: 'मास्टर शेड्यूल बेसलाइन को छूने से पहले प्रोजेक्ट कंट्रोल्स प्लानर हर अपडेट को जांचता है।',
      tapToExpand: 'यह कैसे काम करता है जानने के लिए ऊपर खींचें',
      tapToCollapse: 'बंद करने के लिए नीचे खींचें',
    },
    intro: {
      step1Title: 'अपना अपडेट बोलें',
      step1Desc: 'हिंदी, अंग्रेजी या दोनों। फील्ड सुपरवाइजर 15 सेकंड से भी कम समय में प्रगति या देरी दर्ज करते हैं।',
      step2Title: 'हम इसे शेड्यूल से जोड़ते हैं',
      step2Desc: 'सटीक AI फील्ड साक्ष्य को प्राइमावेरा P6 एक्टिविटीज से कॉन्फिडेंस स्कोर के साथ जोड़ता है।',
      step3Title: 'आपके प्लानर इसे सत्यापित करते हैं',
      step3Desc: 'मास्टर शेड्यूल अपडेट होने से पहले आपका प्लानर हर मैच को सत्यापित करता है। कोई गलत जानकारी नहीं।',
      skip: 'छोड़ें',
      next: 'आगे बढ़ें',
      continue: 'लॉग इन करें',
    },
    login: {
      title: 'प्रोजेक्ट में साइन इन करें',
      subtitle: 'अपनी कर्मचारी आईडी और 6-अंकों का पिन दर्ज करें।',
      employeeId: 'कर्मचारी आईडी',
      employeeIdPlaceholder: 'जैसे SUP-0412',
      pin: '6-अंकों का पिन',
      signIn: 'साइन इन करें',
      signingIn: 'सत्यापित हो रहा है...',
      sso: 'कंपनी SSO के साथ जारी रखें',
      forgotPin: 'पिन भूल गए?',
      requestAccess: 'पहुंच का अनुरोध करें',
      demoAccounts: 'डेमो खाते',
      lockedMsg: (seconds) => `बहुत अधिक असफल प्रयास। खाता ${seconds} सेकंड के लिए लॉक है।`,
      wrongPin: (triesLeft) => `पिन इस कर्मचारी आईडी से मेल नहीं खाता। ${triesLeft} प्रयास शेष।`,
      unknownId: (id) => `${id} के लिए कोई खाता नहीं मिला। आईडी जांचें या अनुरोध करें।`,
    },
    demoSheet: {
      title: 'डेमो खाते',
      subtitle: 'बिना पिन के तुरंत साइन इन करने के लिए कोई भी भूमिका चुनें',
      footer: 'डेमो डेटा सिंथेटिक है।',
    },
    forgotPinSheet: {
      step1Title: 'पिन भूल गए',
      step1Desc: '6-अंकों का रीसेट कोड प्राप्त करने के लिए अपनी कर्मचारी आईडी दर्ज करें।',
      sendCode: 'कोड भेजें',
      step2Title: 'सत्यापन कोड दर्ज करें',
      step2Desc: 'हमने आपके पंजीकृत मोबाइल नंबर पर 6-अंकों का कोड भेजा है।',
      demoHint: 'डेमो संकेत: कोड 482913 का उपयोग करें',
      verify: 'कोड सत्यापित करें',
      resendIn: (seconds) => `${seconds} सेकंड में पुनः भेजें`,
      resendNow: 'कोड पुनः भेजें',
      codeError: 'गलत सत्यापन कोड। कृपया पुनः प्रयास करें।',
      step3Title: 'नया पिन सेट करें',
      step3Desc: 'अपने खाते के लिए नया 6-अंकों का पिन बनाएं।',
      newPin: 'नया 6-अंकों का पिन',
      confirmPin: 'पिन की पुष्टि करें',
      savePin: 'पिन सहेजें',
      pinMismatch: 'पिन मेल नहीं खा रहे हैं। कृपया दोनों फ़ील्ड जांचें।',
      successTitle: 'पिन सफलतापूर्वक रीसेट हुआ',
      successDesc: 'आपका पिन अपडेट हो गया है। अब आप नए पिन के साथ साइन इन कर सकते हैं।',
      backToLogin: 'साइन इन पर वापस जाएं',
    },
    requestAccess: {
      title: 'प्रोजेक्ट पहुंच अनुरोध',
      subtitle: 'प्रोजेक्ट कंट्रोल्स की पहुंच के लिए व्यवस्थापक से अनुरोध करें।',
      fullName: 'पूरा नाम',
      contact: 'कर्मचारी आईडी या मोबाइल',
      contractor: 'ठेकेदार / संस्था',
      project: 'प्रोजेक्ट',
      role: 'अनुरोधित भूमिका',
      submit: 'अनुरोध भेजें',
      submitting: 'अनुरोध भेजा जा रहा है...',
      successTitle: 'अनुरोध प्राप्त हुआ',
      refNumber: 'REQ-0087',
      successDesc: 'आपका अनुरोध प्रोजेक्ट एडमिन को भेज दिया गया है। स्वीकृत होने पर आपको एसएमएस मिलेगा।',
      backToLogin: 'साइन इन पर वापस जाएं',
    },
    projectPicker: {
      title: 'प्रोजेक्ट चुनें',
      subtitle: 'सक्रिय पाइपलाइन या सुविधा निष्पादन पैकेज का चयन करें',
      activeProjects: 'सक्रिय प्रोजेक्ट्स',
    },
    permissions: {
      title: 'फील्ड अनुमतियां सक्षम करें',
      subtitle: 'SchedBridge AI को हैंड्स-फ्री वॉयस रिपोर्टिंग के लिए माइक्रोफ़ोन की आवश्यकता होती है।',
      micTitle: 'माइक्रोफ़ोन',
      micDesc: 'फील्ड से 15-सेकंड की वॉयस रिपोर्ट रिकॉर्ड करने के लिए आवश्यक।',
      notifTitle: 'सूचनाएं',
      notifDesc: 'जब प्लानर आपकी रिपोर्ट की समीक्षा करें तो अलर्ट प्राप्त करें।',
      locTitle: 'स्थान',
      locDesc: 'वैकल्पिक। रिपोर्ट में स्वतः चेनेज / KP टैग करता है।',
      allow: 'अनुमति दें',
      allowed: 'स्वीकृत ✓',
      notNow: 'अभी नहीं',
      continue: 'प्रोजेक्ट पर आगे बढ़ें',
      micDeniedWarning: 'माइक्रोफ़ोन अस्वीकृत। कैप्चर स्क्रीन टाइपिंग मोड में चलेगी।',
    },
    languageSheet: {
      title: 'भाषा चुनें',
      subtitle: 'इंटरफ़ेस के लिए अपनी पसंदीदा भाषा चुनें',
      fallbackNotice: '',
    },
  },
  mr: {
    welcome: {
      overlay1: 'From',
      overlay2: 'Sites to',
      overlay3: 'a Smarter',
      overlay4: 'Tomorrow',
      tagline: 'Turn field progress into schedule intelligence.',
      desc: 'Connect voice, field logs and Primavera P6 into one verified source of project truth.',
      getStarted: 'Get Started ›',
      alreadyHaveAccount: 'Already have an account? ',
      logIn: 'Log In',
      caption: 'Planning-to-Execution Intelligence',
      value1Title: 'Capture by voice in 15 seconds',
      value1Desc: 'Field supervisors speak updates in Marathi, Hindi, or English directly on site.',
      value2Title: 'Linked to the right P6 activity',
      value2Desc: 'Deterministic AI identifies WBS elements and spools with high confidence.',
      value3Title: 'Verified by your planner',
      value3Desc: 'Controls planners approve verified updates before touching baseline.',
      tapToExpand: 'Tap or drag up to learn how it works',
      tapToCollapse: 'Tap or drag down to close',
    },
    intro: {
      step1Title: 'Speak your update',
      step1Desc: 'Report field progress or delays in under 15 seconds.',
      step2Title: 'We link it to the schedule',
      step2Desc: 'Deterministic AI matches field evidence to Primavera P6 activities.',
      step3Title: 'Your planner verifies it',
      step3Desc: 'Your planner verifies every match before master schedule updates.',
      skip: 'Skip',
      next: 'Next',
      continue: 'Continue to Login',
    },
    login: {
      title: 'Sign in to your project',
      subtitle: 'Use your employee ID and 6-digit PIN.',
      employeeId: 'Employee ID',
      employeeIdPlaceholder: 'e.g. SUP-0412',
      pin: '6-Digit PIN',
      signIn: 'Sign in',
      signingIn: 'Verifying...',
      sso: 'Continue with company SSO',
      forgotPin: 'Forgot PIN?',
      requestAccess: 'Request access',
      demoAccounts: 'Demo accounts',
      lockedMsg: (seconds) => `Too many failed attempts. Account locked for ${seconds}s.`,
      wrongPin: (triesLeft) => `PIN doesn't match this employee ID. ${triesLeft} tries left.`,
      unknownId: (id) => `No account found for ${id}. Check the ID or request access.`,
    },
    demoSheet: {
      title: 'Demo accounts',
      subtitle: 'Select any role to sign in immediately without a PIN',
      footer: 'Demo data is synthetic.',
    },
    forgotPinSheet: {
      step1Title: 'Forgot PIN',
      step1Desc: 'Enter your Employee ID to receive a 6-digit reset code.',
      sendCode: 'Send code',
      step2Title: 'Enter verification code',
      step2Desc: 'We sent a 6-digit code to your registered mobile number.',
      demoHint: 'Demo hint: use code 482913',
      verify: 'Verify code',
      resendIn: (seconds) => `Resend code in ${seconds}s`,
      resendNow: 'Resend code',
      codeError: 'Incorrect verification code. Please try again.',
      step3Title: 'Set new PIN',
      step3Desc: 'Create a new 6-digit PIN for your account.',
      newPin: 'New 6-Digit PIN',
      confirmPin: 'Confirm PIN',
      savePin: 'Save PIN',
      pinMismatch: 'PINs do not match.',
      successTitle: 'PIN reset successful',
      successDesc: 'Your PIN has been updated.',
      backToLogin: 'Back to sign in',
    },
    requestAccess: {
      title: 'Request Project Access',
      subtitle: 'Ask an administrator for access.',
      fullName: 'Full name',
      contact: 'Employee ID or mobile',
      contractor: 'Contractor / Organisation',
      project: 'Project',
      role: 'Requested role',
      submit: 'Submit request',
      submitting: 'Submitting request...',
      successTitle: 'Request submitted',
      refNumber: 'REQ-0087',
      successDesc: 'Your request has been forwarded to the Project Admin.',
      backToLogin: 'Back to sign in',
    },
    projectPicker: {
      title: 'Select Project',
      subtitle: 'Choose an active pipeline or facility execution package',
      activeProjects: 'Active Projects',
    },
    permissions: {
      title: 'Enable Field Permissions',
      subtitle: 'Microphone access is required for field voice reports.',
      micTitle: 'Microphone',
      micDesc: 'Required to record 15-second voice reports.',
      notifTitle: 'Notifications',
      notifDesc: 'Get alerts when planners review or clarify your updates.',
      locTitle: 'Location',
      locDesc: 'Optional. Tags reports with chainage / KP.',
      allow: 'Allow',
      allowed: 'Allowed ✓',
      notNow: 'Not now',
      continue: 'Continue to Project',
      micDeniedWarning: 'Microphone denied. Capture screen will default to typing.',
    },
    languageSheet: {
      title: 'Select Language',
      subtitle: 'Choose your preferred language',
      fallbackNotice: 'मराठी अनुवाद लवकरच पूर्ण उपलब्ध होईल · Falling back to English with Marathi terms.',
    },
  },
  gu: {
    welcome: {
      overlay1: 'From',
      overlay2: 'Sites to',
      overlay3: 'a Smarter',
      overlay4: 'Tomorrow',
      tagline: 'Turn field progress into schedule intelligence.',
      desc: 'Connect voice, field logs and Primavera P6 into one verified source of project truth.',
      getStarted: 'Get Started ›',
      alreadyHaveAccount: 'Already have an account? ',
      logIn: 'Log In',
      caption: 'Planning-to-Execution Intelligence',
      value1Title: 'Capture by voice in 15 seconds',
      value1Desc: 'Field supervisors speak updates in Gujarati, Hindi, or English on site.',
      value2Title: 'Linked to the right P6 activity',
      value2Desc: 'Deterministic AI identifies WBS elements and spools accurately.',
      value3Title: 'Verified by your planner',
      value3Desc: 'Controls planners approve verified updates before touching baseline.',
      tapToExpand: 'Tap or drag up to learn how it works',
      tapToCollapse: 'Tap or drag down to close',
    },
    intro: {
      step1Title: 'Speak your update',
      step1Desc: 'Report field progress or delays in under 15 seconds.',
      step2Title: 'We link it to the schedule',
      step2Desc: 'Deterministic AI matches field evidence to Primavera P6 activities.',
      step3Title: 'Your planner verifies it',
      step3Desc: 'Your planner verifies every match before master schedule updates.',
      skip: 'Skip',
      next: 'Next',
      continue: 'Continue to Login',
    },
    login: {
      title: 'Sign in to your project',
      subtitle: 'Use your employee ID and 6-digit PIN.',
      employeeId: 'Employee ID',
      employeeIdPlaceholder: 'e.g. SUP-0412',
      pin: '6-Digit PIN',
      signIn: 'Sign in',
      signingIn: 'Verifying...',
      sso: 'Continue with company SSO',
      forgotPin: 'Forgot PIN?',
      requestAccess: 'Request access',
      demoAccounts: 'Demo accounts',
      lockedMsg: (seconds) => `Too many failed attempts. Account locked for ${seconds}s.`,
      wrongPin: (triesLeft) => `PIN doesn't match this employee ID. ${triesLeft} tries left.`,
      unknownId: (id) => `No account found for ${id}. Check the ID or request access.`,
    },
    demoSheet: {
      title: 'Demo accounts',
      subtitle: 'Select any role to sign in immediately without a PIN',
      footer: 'Demo data is synthetic.',
    },
    forgotPinSheet: {
      step1Title: 'Forgot PIN',
      step1Desc: 'Enter your Employee ID to receive a 6-digit reset code.',
      sendCode: 'Send code',
      step2Title: 'Enter verification code',
      step2Desc: 'We sent a 6-digit code to your registered mobile number.',
      demoHint: 'Demo hint: use code 482913',
      verify: 'Verify code',
      resendIn: (seconds) => `Resend code in ${seconds}s`,
      resendNow: 'Resend code',
      codeError: 'Incorrect verification code. Please try again.',
      step3Title: 'Set new PIN',
      step3Desc: 'Create a new 6-digit PIN for your account.',
      newPin: 'New 6-Digit PIN',
      confirmPin: 'Confirm PIN',
      savePin: 'Save PIN',
      pinMismatch: 'PINs do not match.',
      successTitle: 'PIN reset successful',
      successDesc: 'Your PIN has been updated.',
      backToLogin: 'Back to sign in',
    },
    requestAccess: {
      title: 'Request Project Access',
      subtitle: 'Ask an administrator for access.',
      fullName: 'Full name',
      contact: 'Employee ID or mobile',
      contractor: 'Contractor / Organisation',
      project: 'Project',
      role: 'Requested role',
      submit: 'Submit request',
      submitting: 'Submitting request...',
      successTitle: 'Request submitted',
      refNumber: 'REQ-0087',
      successDesc: 'Your request has been forwarded to the Project Admin.',
      backToLogin: 'Back to sign in',
    },
    projectPicker: {
      title: 'Select Project',
      subtitle: 'Choose an active pipeline or facility execution package',
      activeProjects: 'Active Projects',
    },
    permissions: {
      title: 'Enable Field Permissions',
      subtitle: 'Microphone access is required for field voice reports.',
      micTitle: 'Microphone',
      micDesc: 'Required to record 15-second voice reports.',
      notifTitle: 'Notifications',
      notifDesc: 'Get alerts when planners review or clarify your updates.',
      locTitle: 'Location',
      locDesc: 'Optional. Tags reports with chainage / KP.',
      allow: 'Allow',
      allowed: 'Allowed ✓',
      notNow: 'Not now',
      continue: 'Continue to Project',
      micDeniedWarning: 'Microphone denied. Capture screen will default to typing.',
    },
    languageSheet: {
      title: 'Select Language',
      subtitle: 'Choose your preferred language',
      fallbackNotice: 'ગુજરાતી અનુવાદ ટૂંક સમયમાં ઉપલબ્ધ થશે · Falling back to English with Gujarati notes.',
    },
  },
};
