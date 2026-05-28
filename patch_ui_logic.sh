cat << 'PATCH' > ui_logic.patch
--- ui-logic.js
+++ ui-logic.js
@@ -252,6 +252,18 @@
     }
 }

+const ALGO_UI_CONFIG = {
+    classic: { show: ["classicGroup"], hideDensity: true },
+    image: { show: ["imageGroup"], hideDensity: true },
+    wolfram: { show: ["algoOptions", "wolframRuleLabel", "seedPatternLabel"], hideDensity: true, checkCustomSeed: true },
+    cellular: { show: ["algoOptions", "seedPatternLabel"], checkCustomSeed: true },
+    perlin: { show: ["algoOptions", "perlinScaleLabel"] },
+    seed: { hideDensity: true },
+    sierpinski: { hideDensity: true },
+    waves: { show: ["algoOptions", "waveCountLabel"] },
+    gameOfLife: { show: ["algoOptions", "seedPatternLabel"], checkCustomSeed: true }
+};
+
 function updateAlgoUI() {
     const classicGroup = document.getElementById("classicGroup");
     const imageGroup = document.getElementById("imageGroup");
@@ -271,7 +283,6 @@
     seedPatternLabel.hidden = true;
     if (customSeedLabel) customSeedLabel.hidden = true;
     perlinScaleLabel.hidden = true;
     waveCountLabel.hidden = true;
     densityGroup.hidden = false;
     param2Group.hidden = true;

@@ -288,35 +299,19 @@
         }
     }

-    if (algorithm === "classic") {
-        classicGroup.hidden = false;
-        densityGroup.hidden = true;
-    } else if (algorithm === "image") {
-        imageGroup.hidden = false;
-        densityGroup.hidden = true;
-    } else if (algorithm === "wolfram") {
-        algoOptions.hidden = false;
-        wolframRuleLabel.hidden = false;
-        seedPatternLabel.hidden = false;
-        if (customSeedLabel && document.getElementById("seedPattern").value === "custom") customSeedLabel.hidden = false;
-        densityGroup.hidden = true;
-    } else if (algorithm === "cellular") {
-        algoOptions.hidden = false;
-        seedPatternLabel.hidden = false;
-        if (customSeedLabel && document.getElementById("seedPattern").value === "custom") customSeedLabel.hidden = false;
-    } else if (algorithm === "perlin") {
-        algoOptions.hidden = false;
-        perlinScaleLabel.hidden = false;
-    } else if (algorithm === "seed") {
-        densityGroup.hidden = true;
-    } else if (algorithm === "sierpinski") {
-        densityGroup.hidden = true;
-    } else if (algorithm === "waves") {
-        algoOptions.hidden = false;
-        waveCountLabel.hidden = false;
-    } else if (algorithm === "gameOfLife") {
-        algoOptions.hidden = false;
-        seedPatternLabel.hidden = false;
-        if (customSeedLabel && document.getElementById("seedPattern").value === "custom") customSeedLabel.hidden = false;
+    const config = ALGO_UI_CONFIG[algorithm];
+    if (config) {
+        if (config.show) {
+            config.show.forEach(id => {
+                const el = document.getElementById(id);
+                if (el) el.hidden = false;
+            });
+        }
+        if (config.hideDensity) {
+            densityGroup.hidden = true;
+        }
+        if (config.checkCustomSeed && customSeedLabel && document.getElementById("seedPattern").value === "custom") {
+            customSeedLabel.hidden = false;
+        }
     }

     const hasAdvancedOptions = !imageGroup.hidden || !algoOptions.hidden || !param2Group.hidden;
PATCH
patch ui-logic.js ui_logic.patch
