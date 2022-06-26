import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Users } from 'src/app/models/users';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {

  user!: Users;

  hide = true;
  hideProgress: boolean = true;

  userFormGroup = new FormGroup(
    {
      nameFormControl: new FormControl('', Validators.required),
      loginFormControl: new FormControl(''),
      passwordFormControl: new FormControl('', Validators.required)
    });

  constructor(private router: Router, private cd: ChangeDetectorRef) {

    this.user = this.router.getCurrentNavigation()!.extras.state!["user"] as Users;
  }

  ngOnInit(): void {

    this.cd.detectChanges();
  }

  save() {

  }

  setTitle() {

    return (this.user ? 'Meus Dados' : 'Cadastrar Usuário');
  }
}
