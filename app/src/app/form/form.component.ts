import { Component, OnInit } from '@angular/core';

import { FormBuilder, FormGroup, FormControl, Validators, FormArray } from '@angular/forms';

import { SettingsModel } from '../tagify/angular-tagify.component';

import { FirebaseService } from '../services/firebase.service';
import { Router } from '@angular/router';


export interface Emotion {
  id: string,
  name: string,
}

export interface Activity {
  id: string
}

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})
export class FormComponent implements OnInit {
  entryForm!: FormGroup;
  emotions: Emotion[] = [];
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
              private firebase: FirebaseService,
              private router: Router) { }

  ngOnInit(): void {
    const emotionGroup: {[key: string]: any} = {};

    // Generate a form group based on available emotions.
    this.firebase.emotions.subscribe(emotions => {
      // Sort by name.
      emotions.sort((a, b) => a.payload.doc.id > b.payload.doc.id ? 1 : -1);

      emotions.forEach((e: any) => {
        const doc = e.payload.doc;

        this.emotions.push(Object.assign({id: doc.id}, doc.data()));
        emotionGroup[doc.id] = this.fb.control("");
      });

      this.entryForm = this.fb.group({
        activities: [],
        emotions: this.fb.group(emotionGroup),
      });
    });

    this.firebase.activities.subscribe(activitySnapshots => {
      this.tagifySettings.whitelist = activitySnapshots.map(a => a.payload.doc.id);
      this.activitiesReady = true;
    })
  }

  onSubmit(value: {[key: string]: any}) {
    value.activities = value.activities ? value.activities.map(el => el.value) : [];

    // Remove emotions which were not set.
    value.emotions = Object.entries(value.emotions)
      .filter((item) => item[1] != "")
      .reduce((obj, item) => {
        obj[item[0]] = item[1];
        return obj;
      }, {})
      
    this.firebase.addEntry(value).then(res => {
      this.router.navigate(["/list"]);
    });
  }

}
