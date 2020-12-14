import { Component, OnInit } from '@angular/core';
import { Entry, FirebaseService } from '../services/firebase.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit {

  entries: Entry[];
  displayedColumns = ["createdAt", "activities"];

  constructor(private firebase: FirebaseService) { }

  ngOnInit(): void {
    this.firebase.getRecentEntries().subscribe((entries) => {
      this.entries = entries;
    })
  }

}
