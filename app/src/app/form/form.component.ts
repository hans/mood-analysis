import { Component, OnInit } from '@angular/core';

import { FormBuilder, FormGroup, FormControl, Validators, FormArray } from '@angular/forms';

import { SettingsModel } from '../tagify/angular-tagify.component';

import { FirebaseService } from '../services/firebase.service';


export interface Emotion {
  name: string,
}

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})
export class FormComponent implements OnInit {
  entryForm!: FormGroup;
  emotions: {[key: string]: Emotion} = {};
  get emotionControls() {
    return this.entryForm.get("emotions") as FormGroup;
  }

  tagifySettings: SettingsModel = {
    autoComplete: { enabled: true, rightKey: true },
    whitelist: []
  };
  activitiesReady = false;

  validation_messages = {
    name: [
      {type: "required", message: "Name is required"}
    ]
  }

  constructor(private fb: FormBuilder,
              private firebase: FirebaseService) { }

  ngOnInit(): void {
    const emotionGroup: {[key: string]: any} = {};

    // Generate a form group based on available emotions.
    this.firebase.emotions.subscribe(emotions => {
      emotions.forEach((e: any) => {
        console.log(e)
        const doc = e.payload.doc;
        this.emotions[doc.id] = doc.data();
        emotionGroup[doc.id] = this.fb.control("");
      });
  //  }).then(() => {
      this.entryForm = this.fb.group({
        activities: ["st"],
        emotions: this.fb.group(emotionGroup),
      });

      console.log(this.entryForm)
    });

    this.firebase.activities.subscribe(activities => {
      this.tagifySettings.whitelist = activities.map(a => a.name);
      this.activitiesReady = true;
    })
  }

  onSubmit(value: {string: any}) {
    console.log(value);

    // Create test entry.
    console.log(this.firebase.addEntry(value));
  }

}
