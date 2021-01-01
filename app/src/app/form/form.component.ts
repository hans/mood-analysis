import { Component, OnInit } from '@angular/core';

import { FormBuilder, FormGroup, FormControl } from '@angular/forms';

import { SettingsModel } from '../tagify/angular-tagify.component';
import { TagifyService } from '../tagify/angular-tagify.service';

import { FirebaseService, Timestamp } from '../services/firebase.service';
import { Router } from '@angular/router';

export interface Emotion {
  id: string;
  name: string;
}

export interface Activity {
  id: string;
}

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css'],
})
export class FormComponent implements OnInit {
  entryForm!: FormGroup;
  emotions: Emotion[] = [];
  get emotionControls(): FormGroup {
    return this.entryForm.get('emotions') as FormGroup;
  }

  tagifySettings: SettingsModel = {
    autoComplete: { enabled: true, rightKey: true },
    whitelist: [],
  };
  activitiesReady = false;
  frequentActivities: { name: string; count: number }[];
  frequentActivitiesReady = false;

  validation_messages = {
    name: [{ type: 'required', message: 'Name is required' }],
  };

  constructor(
    private fb: FormBuilder,
    private firebase: FirebaseService,
    private router: Router,
    private tagifyService: TagifyService,
  ) {}

  ngOnInit(): void {
    const emotionGroup: { [key: string]: FormControl } = {};

    // Generate a form group based on available emotions.
    this.firebase.emotions.subscribe((emotions) => {
      // Sort by name.
      emotions.sort((a, b) => (a.payload.doc.id > b.payload.doc.id ? 1 : -1));

      emotions.forEach((e) => {
        const doc = e.payload.doc;

        this.emotions.push(Object.assign({ id: doc.id }, doc.data()));
        emotionGroup[doc.id] = this.fb.control('');
      });

      this.entryForm = this.fb.group({
        activities: [],
        emotions: this.fb.group(emotionGroup),
      });
    });

    this.firebase.activities.subscribe((activitySnapshots) => {
      this.tagifySettings.whitelist = activitySnapshots.map(
        (a) => a.payload.doc.id,
      );
      this.activitiesReady = true;
    });

    this.firebase.getFrequentActivities().subscribe((acts) => {
      this.frequentActivities = acts.map((a) => {
        return { name: a.payload.doc.id, count: a.payload.doc.data().count };
      });
      this.frequentActivitiesReady = true;
    });
  }

  onSubmit(value: { [key: string]: any }): void {
    const activities = value.activities
      ? value.activities.map((el) => el.value)
      : [];

    // Remove emotions which were not set.
    const emotions = Object.entries(value.emotions)
      .filter((item) => item[1] != '')
      .reduce((obj, item) => {
        obj[item[0]] = item[1];
        return obj;
      }, {});

    const entry = {
      activities: activities,
      emotions: emotions,
      createdAt: this.firebase.now(),
    };
    this.firebase.addEntry(entry).then(() => {
      this.router.navigate(['/list']);
    });
  }

  onPickActivity(event: MouseEvent, activity: string): void {
    // Remove associated tag component
    let el = event.srcElement as HTMLElement;
    // find tagify root node for this tag
    while (
      !el.hasAttribute('class') ||
      ` ${el.getAttribute('class')} `.indexOf(' tagify__tag ') == -1
    ) {
      el = el.parentNode as HTMLElement;
    }
    // One more up
    el = el.parentNode as HTMLElement;
    el.parentNode.removeChild(el);

    this.tagifyService.addTags([activity]);
  }
}
