import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Categories } from 'src/app/models/categories.model';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss']
})
export class CategoryComponent implements OnInit {

  categoryFormGroup = new FormGroup(
    {
      nameFormControl: new FormControl('', Validators.required)
    });

  constructor(
    public dialogRef: MatDialogRef<CategoryComponent>,
    @Inject(MAT_DIALOG_DATA) public category: Categories) { }

  ngOnInit(): void {
  }

  setTitle() {

    return 'Categoria - ' + (this.category.editing ? 'Editar' : 'Incluir');
  }

  cancel(): void {

    this.dialogRef.close();
  }

  save(): void {

    this.dialogRef.close(this.category);
  }

  delete(): void {

    this.category.deleting = true;

    this.dialogRef.close(this.category);
  }
}
