import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { People } from 'src/app/models/people.model';

@Component({
  selector: 'app-people',
  templateUrl: './people.component.html',
  styleUrls: ['./people.component.css']
})
export class PeopleComponent implements OnInit {

  peopleFormGroup = new FormGroup(
    {
      nameFormControl: new FormControl('', Validators.required)
    });

  constructor(
    public dialogRef: MatDialogRef<PeopleComponent>,
    @Inject(MAT_DIALOG_DATA) public people: People) { }

  ngOnInit(): void {
  }

  setTitle() {

    return 'Pessoa - ' + (this.people.editing ? 'Editar' : 'Incluir');
  }

  cancel(): void {

    this.dialogRef.close();
  }

  save(): void {

    this.dialogRef.close(this.people);
  }

  delete(): void {

    this.people.deleting = true;

    this.dialogRef.close(this.people);
  }
}
