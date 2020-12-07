import { Component, OnInit } from '@angular/core';

import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';

import { FirebaseService } from '../services/firebase.service';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})
export class FormComponent implements OnInit {
  entryForm: FormGroup;

  validation_messages = {
    name: [
      {type: "required", message: "Name is required"}
    ]
  }

  constructor(private fb: FormBuilder,
              private firebase: FirebaseService) { }

  ngOnInit(): void {
    const entryForm: any = {};

    // Generate a form group based on available emotions.
    this.firebase.getEmotions().subscribe(emotions => {
      emotions.forEach(e => {
        entryForm[e.id] = new FormControl()
      })
    });

    // Create form
    this.entryForm = this.fb.group({
      name: ["", Validators.required],
    })
  }

}
