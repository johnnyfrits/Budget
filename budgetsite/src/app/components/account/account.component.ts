import { ChangeDetectorRef, Component, Inject, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Accounts } from 'src/app/models/accounts.model';
import { AccountService } from 'src/app/services/account/account.service';
import { NgxMatColorPickerComponent, Color } from '@angular-material-components/color-picker';
@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit {

  accounts?: Accounts[];
  accountId?: number;
  reference?: string;
  referenceHead?: string;
  account!: Accounts;
  hideProgress: boolean = false;
  buttonName: string = "";

  constructor(private accountService: AccountService,
    private cd: ChangeDetectorRef,
    public dialog: MatDialog
  ) {

    this.accountId = Number(localStorage.getItem("accountId"));
  }

  ngAfterViewInit(): void {

    this.cd.detectChanges();
  }

  ngOnInit(): void {

    this.accountService.read().subscribe(
      {
        next: accounts => {

          this.accounts = accounts;

          this.accounts.forEach(account => {

            if (account.id == this.accountId) {

              this.setAccount(account);
            }
          });

          this.hideProgress = true;
        },
        error: () => this.hideProgress = true
      });
  }

  setReference(reference: string) {

    this.reference = reference;

    this.referenceHead = this.reference.substr(4, 2) + "/" + this.reference.substr(0, 4);
  }

  setAccount(account: Accounts) {

    if (account) {

      this.buttonName = account.name;
      this.hideProgress = false;

      this.accountId = account.id;
      this.account = account;

      localStorage.setItem("accountId", account.id!.toString());
    }

    this.hideProgress = true;
  }

  getAccountsNotDisabled(accounts?: Accounts[]) {

    return accounts?.filter(account => account.disabled == null || account.disabled == false);
  }

  accountDialog() {

    const dialogRef = this.dialog.open(AccountDialog, {
      width: '400px',
      data: this.accounts
    });

    dialogRef.afterClosed().subscribe(result => {

      if (result) {

        this.hideProgress = false;

        if (result.deleting) {

          this.accountService.delete(result.id).subscribe(
            {
              next: () => {

                this.accounts = this.accounts!.filter(t => t.id! != result.id!);

                if (this.accounts.length > 0) {

                  this.setAccount(this.accounts[0]);
                }
              },
              error: () => this.hideProgress = true
            }
          );
        }
      }
    });
  }
}

@Component({
  selector: 'account-dialog',
  templateUrl: 'account-dialog.html',
  styleUrls: ['./account.component.scss']
})
export class AccountDialog implements OnInit, AfterViewInit {

  @ViewChild('picker1') picker1!: NgxMatColorPickerComponent;
  @ViewChild('picker2') picker2!: NgxMatColorPickerComponent;

  id?: number;
  buttonName: string = "";
  buttonText: string = "Nome da Conta";

  accountFormGroup = new FormGroup({

    nameFormControl: new FormControl('', Validators.required),
    backgroundFormControl: new FormControl('', Validators.required),
    colorFormControl: new FormControl('', Validators.required),
    disabledFormControl: new FormControl(''),
  });

  constructor(
    public dialogRef: MatDialogRef<AccountDialog>,
    @Inject(MAT_DIALOG_DATA) public accounts: Accounts[],
    private cd: ChangeDetectorRef
  ) {
  }

  ngAfterViewInit(): void {

    this.addAccount();
    this.cd.detectChanges();
  }

  ngOnInit(): void {

  }

  cancel(): void {

    this.dialogRef.close();
  }

  save(): void {

    let account: Accounts = {
      id: this.id,
      userId: 1,
      name: this.accountFormGroup.get('nameFormControl')?.value,
      background: this.accountFormGroup.get('backgroundFormControl')?.value,
      color: this.accountFormGroup.get('colorFormControl')?.value
    };

    this.dialogRef.close(account);
  }

  delete(account: Accounts): void {

    this.dialogRef.close(account);
  }

  addAccount() {

    this.id = undefined;

    this.accountFormGroup.get('nameFormControl')?.setValue('');
    this.accountFormGroup.get('disabledFormControl')?.setValue(false);

    this.setBackgroundAndColor('#000000', '#ffffff');
  }

  onNameChange(name: any) {

    this.buttonText = name != '' ? name : "Nome da Conta";
  }

  setAccount(account: Accounts) {

    if (account) {

      this.buttonName = account.name;

      this.id = account.id;

      this.accountFormGroup.get('nameFormControl')?.setValue(account.name);
      this.accountFormGroup.get('disabledFormControl')?.setValue(account.disabled);

      this.setBackgroundAndColor(account.background!, account.color!);
    }
  }

  setBackgroundAndColor(background: string, color: string) {

    this.accountFormGroup.get('backgroundFormControl')?.setValue(background);
    this.accountFormGroup.get('colorFormControl')?.setValue(color);

    const color1 = this.hexToRgb(background);
    const color2 = this.hexToRgb(color);

    this.picker1._pickerInput.value = new Color(color1!.r, color1!.g, color1!.b);
    this.picker2._pickerInput.value = new Color(color2!.r, color2!.g, color2!.b);
  }

  hexToRgb(hex: string) {

    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;

    hex = hex.replace(shorthandRegex, (m, r, g, b) => {
      return r + r + g + g + b + b;
    });

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }
}
