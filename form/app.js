const emotions = "afraid amused angry bored calm disgusted embarrassed excited frustrated grateful happy neutral proud relieved sad serene surprised focused".split(" ").concat(["worn out"]);
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

require(['jquery', "tagify", 'bootstrap'], ($, Tagify) => {
  $(() => {
    const emotion_group = $("#emotion-group");
    emotions.forEach(emotion => {
      const row = emotion_template.replaceAll("{e}", emotion);
      console.log(row)
      emotion_group.append($(row));
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
  });
});
