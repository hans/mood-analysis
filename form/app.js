
const emotion_template = "<div class='row'>\
<div class='col-md-2 range-label'><label for='emotion-{e}'>{e}</label></div>\
<div class='col-md-10'><input type='range' min='1' max='7' step='1' list='ticklist' class='form-control' name='emotion-{e}' /></div>\
</div>";

const tag_inputs = {
  activities: {whitelist: ["TODO", "abc", "longstringwillit"]},
  sensations: {
    whitelist: ["Tense arms", "Tense legs", "Headache", "Jitters", "Chest pain", "Soreness/tightness"],
    enforceWhitelist: false
  },
}

const DEFAULT_EMOTIONS = "afraid amused angry bored calm disgusted embarrassed excited frustrated grateful happy neutral proud relieved sad serene surprised focused".split(" ").concat(["worn out"]);

const SETTINGS_KEY_FIREBASE_CONFIG = "firebaseConfig";

require(["utils", 'jquery', "tagify", 'bootstrap', "@firebase/app", "js-cookie", "@firebase/firestore"],
  (utils, $, Tagify, bootstrap, firebase, Cookies) => {
  $(() => {
    // Prefill settings modal
    const settings_modal = $("#settingsModal");
    settings_modal.find("textarea#firebaseConfig").val(Cookies.get(SETTINGS_KEY_FIREBASE_CONFIG));
    // Settings modal events
    settings_modal.find(".btn-submit").click(() => {
      const firebase_config = settings_modal.find("textarea#firebaseConfig").val();
      Cookies.set(SETTINGS_KEY_FIREBASE_CONFIG, firebase_config);
      console.log("here", firebase_config)
    })

    // Load settings from cookies
    const firebase_config = JSON.parse(Cookies.get(SETTINGS_KEY_FIREBASE_CONFIG));
    var success = true;
    try {
      firebase.initializeApp(firebase_config);
    } catch {
      success = false;
      console.error("Firebase not properly configured.")
    }

    if (success) {
      const fs = firebase.firestore();

      // Fetch emotions and render controls
      const emotion_group = $("#emotion-group");
      const emotions = fs.collection("emotions").get().then((q) => {
        q.forEach(emotion => {
          console.log(emotion);
          const row = emotion_template.replaceAll("{e}", emotion.get("name"));
          emotion_group.append($(row));
        });
      });

      Object.entries(tag_inputs).forEach(entry => {
        const [id, options] = entry;
        const input = $(`#${id}`)
        new Tagify(input[0], {
          whitelist: options.whitelist,
          enforceWhitelist: options.enforceWhitelist,
          autoComplete: {rightKey: true, highlightFirst: true}
        })
      });
    }
  });
});
