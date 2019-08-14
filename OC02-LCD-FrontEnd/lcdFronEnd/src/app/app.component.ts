import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit  {
  title = 'lcdFronEnd';

  lcdForm: FormGroup
  submitted = false;


  constructor(private formBuilder: FormBuilder) { }


  ngOnInit() {
    this.lcdForm = this.formBuilder.group({
        t: ['', [Validators.required, Validators.min(0)]],
        n: ['', [Validators.required, Validators.min(0)]]
    });
}

// convenience getter for easy access to form fields
get f() { return this.lcdForm.controls; }

onSubmit() {
  this.submitted = true;

  console.log(this.lcdForm)
  // stop here if form is invalid
  if (this.lcdForm.invalid) {
      return;
  }

  // display form values on success
  alert('SUCCESS!! :-)\n\n' + JSON.stringify(this.lcdForm.value, null, 4));
}

onReset() {
  this.submitted = false;
  this.lcdForm.reset();
}
}
