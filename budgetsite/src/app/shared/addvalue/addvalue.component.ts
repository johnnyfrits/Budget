import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Expenses } from 'src/app/models/expenses.model';
import { Incomes } from 'src/app/models/incomes.model';

@Component({
  selector: 'app-addvalue',
  templateUrl: './addvalue.component.html',
  styleUrls: ['./addvalue.component.scss']
})
export class AddvalueComponent implements OnInit {

  addValueFormGroup = new FormGroup({

    amountFormControl: new FormControl('', Validators.required),
  });

  constructor(
    public dialogRef: MatDialogRef<AddvalueComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AddvalueData,
  ) { }

  ngOnInit(): void {
  }

  cancel(): void {

    this.dialogRef.close();
  }

  setTitle() {

    return this.data.description;
  }

  save(): void { }
}

export interface AddvalueData {

  id: number;
  description: string;
  amount: number;
  type: string;
}
