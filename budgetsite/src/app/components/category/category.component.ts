import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Categories } from 'src/app/models/categories.model';
import { CategoryService } from 'src/app/services/category/category.service';

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
    @Inject(MAT_DIALOG_DATA) public category: Categories,
    private categoryService: CategoryService) { }

  ngOnInit(): void {
  }

  setTitle() {

    return 'Categoria - ' + (this.category.editing ? 'Editar' : 'Incluir');
  }

  cancel(): void {

    this.dialogRef.close();
  }

  save(): void {

    this.categoryService.create(this.category).subscribe(
      {
        next: category => {

          this.dialogRef.close(category);
        }
      }
    );
  }

  delete(): void {

    this.category.deleting = true;

    this.dialogRef.close(this.category);
  }
}
