# 📱 AI Resume Architect — Android App Blueprint & Implementation Plan

A complete, production-ready blueprint to build and deploy **AI Resume Architect** as a native Android application in a fresh repository, ensuring pixel-perfect A4 PDF generation, complete offline privacy, and 100% ATS vector compliance.

---

## 📑 Table of Contents
1. [Core Architectural Strategy](#1-core-architectural-strategy)
2. [Fresh Repository Project Structure](#2-fresh-repository-project-structure)
3. [Step-by-Step Implementation Roadmap](#3-step-by-step-implementation-roadmap)
4. [Mobile PDF Generation Architecture](#4-mobile-pdf-generation-architecture)
5. [Mobile UI & UX Adaptations](#5-mobile-ui--ux-adaptations)
6. [Android Native Superpowers (Share Intent & Storage)](#6-android-native-superpowers)
7. [Windows Laptop Development Prerequisites](#7-windows-laptop-development-prerequisites)

---

## 1. Core Architectural Strategy

### Why Capacitor + React/Vite/Tailwind?
* **Single Codebase & Zero Layout Drift**: Desktop Chrome and Android Chrome/System WebView share the exact same Chromium rendering engine. All `@media print` CSS rules, A4 aspect ratios, and bottom-right photo anchor geometry render identically on phone and desktop.
* **100% ATS Vector Quality**: Rather than taking lossy raster screenshots (which break ATS scanners), Android's native `PrintDocumentAdapter` outputs real vector text streams and embedded fonts.
* **Full Privacy & Offline Capability**: Operates 100% client-side with local storage and zero backend dependencies.

---

## 2. Fresh Repository Project Structure

```text
ai-resume-architect-mobile/
├── android/                         # Generated native Android Studio project
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── AndroidManifest.xml  # Permissions, intents, print configs
│   │   │   ├── java/...             # Native bridge entry point
│   │   │   └── res/                 # App launcher icons, splash screen
│   │   └── build.gradle
│   └── build.gradle
├── src/
│   ├── assets/
│   │   └── profile.jpg              # Default headshot asset
│   ├── components/
│   │   ├── ContactHub.jsx           # Lead manager & CSV exporter
│   │   ├── Header.jsx               # Mobile-responsive app bar
│   │   ├── MainLayout.jsx           # Bottom-tab / swipeable mobile container
│   │   ├── PDFExport.jsx            # Document previewer & native PDF engine
│   │   └── PromptGenerator.jsx      # Prompt generator & photo customization
│   ├── config/
│   │   └── defaults.json            # Base ATS/Visual resume templates
│   ├── context/
│   │   └── ResumeContext.jsx        # Global state with Capacitor Preferences/Storage
│   ├── styles/
│   │   └── index.css                # Tailwind v4 styles, print rules, safe-area insets
│   ├── App.jsx
│   └── main.jsx
├── capacitor.config.json            # Capacitor native configuration
├── index.html                       # Viewport with viewport-fit=cover
├── package.json
├── vite.config.js
└── README.md
```

---

## 3. Step-by-Step Implementation Roadmap

### Phase 1: Initialize Fresh Project & Copy Core Web App
1. **Initialize Vite Project**:
   ```bash
   npm create vite@latest ai-resume-architect-mobile -- --template react
   cd ai-resume-architect-mobile
   npm install
   ```
2. **Install Core Dependencies**:
   ```bash
   npm install lucide-react react-markdown clsx tailwindcss @tailwindcss/postcss postcss
   ```
3. **Copy Source Files**:
   * Migrate `src/` (components, assets, config, context, styles).
   * Update `index.html` viewport meta tag to support mobile notches:
     ```html
     <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover, user-scalable=no" />
     ```

### Phase 2: Add Capacitor & Android Platform
1. **Install Capacitor Core & CLI**:
   ```bash
   npm install @capacitor/core
   npm install -D @capacitor/cli
   ```
2. **Initialize Capacitor**:
   ```bash
   npx cap init "AI Resume Architect" com.imrankhan.resumearchitect --web-dir dist
   ```
3. **Install Mobile Plugins**:
   ```bash
   # Native print engine
   npm install @capawesome/capacitor-print
   # Native file system & photo access
   npm install @capacitor/filesystem @capacitor/camera @capacitor/preferences @capacitor/share
   ```
4. **Add Android Platform**:
   ```bash
   npm install @capacitor/android
   npx cap add android
   ```

### Phase 3: Configure Native PDF Printing
In `src/components/PDFExport.jsx`, provide a hybrid print trigger that uses native Android printing on mobile and `window.print()` in standard web browsers:

```javascript
import { Capacitor } from '@capacitor/core';
import { Print } from '@capawesome/capacitor-print';

const handleNativePrint = async () => {
  if (Capacitor.isNativePlatform()) {
    // Android Native Print via Chromium PrintManager
    await Print.print({
      name: pdfFileName || 'Imran_Khan_Resume',
    });
  } else {
    // Standard Desktop Fallback
    window.print();
  }
};
```

### Phase 4: Sync & Build Native Android APK
1. **Build Web Assets**:
   ```bash
   npm run build
   ```
2. **Sync to Android Project**:
   ```bash
   npx cap sync android
   ```
3. **Open Android Studio**:
   ```bash
   npx cap open android
   ```
4. **Compile APK**:
   * In Android Studio, go to: **Build $\rightarrow$ Build Bundle(s) / APK(s) $\rightarrow$ Build APK(s)**.
   * Transfer `.apk` to your phone or run directly on a plugged-in Android device with USB debugging.

---

## 4. Mobile PDF Generation Architecture

### Why Native Printing Works Best on Android
When `@capawesome/capacitor-print` calls `PrintManager.print()`, Android executes:
1. **Headless Chromium Isolation**: Android launches a dedicated, unconstrained print spooler WebView that is not bound to the phone's narrow screen width.
2. **CSS `@media print` Execution**: It reads `@page { size: A4; margin: 0; }` and evaluates all dimensions against true A4 dimensions ($210\text{ mm} \times 297\text{ mm}$ or $595\text{ pt} \times 842\text{ pt}$).
3. **True Vector Spooling**: The output is compiled into an Android PDF document (`PdfDocument`), ensuring:
   * 100% searchable, selectable text for ATS bots.
   * Crisp, un-pixelated fonts and lines regardless of zoom level.
   * Direct integration with Android's system "Save as PDF" and direct sharing via Gmail/WhatsApp.

---

## 5. Mobile UI & UX Adaptations

### 1. Mobile Bottom Navigation
On mobile screens, replace the desktop side-by-side grid with 3 dedicated bottom tabs:
* **Tab 1 — Prompt & Controls**: Job description input, keyword audit, prompt modifiers, and photo customizer.
* **Tab 2 — Live Resume Sheet**: High-fidelity A4 document preview with pinch-to-zoom and the floating "Export PDF" action button.
* **Tab 3 — Outreach Lead Hub**: Contact cards, quick WhatsApp/Email reach-out buttons, and CSV export.

### 2. Notch & Safe-Area Insets
Add CSS safe-area support in `src/styles/index.css`:
```css
body {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}
```

### 3. Native Gallery Picker for Headshot Upload
Replace the browser file input with `@capacitor/camera` for direct access to the Android photo gallery:
```javascript
import { Camera, CameraSource, CameraResultType } from '@capacitor/camera';

const handleMobilePhotoPick = async () => {
  const photo = await Camera.getPhoto({
    resultType: CameraResultType.DataUrl,
    source: CameraSource.Photos,
    quality: 90,
  });
  if (photo.dataUrl) {
    setCustomPhoto(photo.dataUrl);
  }
};
```

---

## 6. Android Native Superpowers

### "Share to Resume Architect" (Receive Job Descriptions Directly)
Configure `AndroidManifest.xml` to accept text shares from LinkedIn, Naukri, or Indeed:

```xml
<activity android:name=".MainActivity" ...>
  <intent-filter>
    <action android:name="android.intent.action.SEND" />
    <category android:name="android.intent.category.DEFAULT" />
    <data android:mimeType="text/plain" />
  </intent-filter>
</activity>
```
* **Workflow**: In LinkedIn on your phone, tap **Share Job $\rightarrow$ AI Resume Architect** $\rightarrow$ the app opens with the JD preloaded and ready to optimize!

---

## 7. Windows Laptop Development Prerequisites

To develop, build, and debug the Android application on your Windows machine, ensure the following are installed and configured:

### 1. Core Tooling
* **Node.js**: `v18+` or `v20+` (LTS recommended).
  * Check via PowerShell: `node -v` and `npm -v`.
* **Git for Windows**: Installed and available in PATH.

### 2. Java Development Kit (JDK)
* **JDK Version**: **JDK 17** or **JDK 21** (Android Gradle Plugin 8+ requires JDK 17+).
  * Recommended: [Eclipse Temurin JDK 17 (Windows x64)](https://adoptium.net/temurin/releases/?version=17) or the JDK bundled inside Android Studio.
* **Environment Variable**:
  * Set `JAVA_HOME` pointing to your JDK path (e.g. `C:\Program Files\Eclipse Adoptium\jdk-17.x.x-hotspot` or `C:\Program Files\Android\Android Studio\jbr`).
  * Add `%JAVA_HOME%\bin` to your system `Path`.

### 3. Android Studio (Hedgehog, Iguana, or Koala)
* Download and install **[Android Studio](https://developer.android.com/studio)**.
* During the setup wizard, ensure the following SDK components are checked:
  * **Android SDK Platform-Tools**
  * **Android SDK Build-Tools** (version 34 or 35)
  * **Android SDK Command-line Tools (latest)**
  * **Android API 34 or 35 (Platform)**
* **Environment Variables**:
  * Add user variable `ANDROID_HOME`:
    ```
    %LOCALAPPDATA%\Android\Sdk
    ```
    *(Usually `C:\Users\<YourUsername>\AppData\Local\Android\Sdk`)*
  * Add the following entries to your system `Path`:
    ```text
    %ANDROID_HOME%\platform-tools
    %ANDROID_HOME%\cmdline-tools\latest\bin
    %ANDROID_HOME%\tools
    ```

### 4. Android Device / Emulator for Testing
* **Option A: Physical Android Phone (Fastest & Most Accurate)**:
  1. On your phone, go to **Settings $\rightarrow$ About Phone $\rightarrow$ Tap "Build Number" 7 times** to unlock Developer Options.
  2. Open **Settings $\rightarrow$ Developer Options $\rightarrow$ Enable "USB Debugging"**.
  3. Connect phone to laptop with a USB cable and tap **Allow USB Debugging** on the phone prompt.
  4. Verify connection in PowerShell:
     ```powershell
     adb devices
     ```
* **Option B: Android Virtual Device (Emulator)**:
  * In Android Studio, open **Virtual Device Manager** and create a Pixel device with Android 14/15 (Google APIs).

### 5. Verification Checklist in Windows Terminal
Run these checks before building:
```powershell
# 1. Verify Node
node -v

# 2. Verify Java
java -version

# 3. Verify Android ADB
adb version

# 4. Verify connected phone
adb devices
```
When all four return valid versions, you have a 100% complete Windows development environment ready to build Android apps!
