import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators} from '@angular/forms';
import { HttpClient, HttpHeaders, HttpParams} from '@angular/common/http'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit  {
  title = 'lcdFronEnd';
  t = "";
  n = "";
  numbers : any


  lcdForm: FormGroup
  submitted = false;


  constructor(private formBuilder: FormBuilder, private http: HttpClient) { }


  ngOnInit() {
    this.lcdForm = this.formBuilder.group({
        t: ['', [Validators.required, Validators.min(0)]],
        n: ['', [Validators.required, Validators.min(0)]]
    });


}

  // convenience getter for easy access to form fields
  get f() { return this.lcdForm.controls; }

onSubmit() {

  let root_url = "http://localhost:8090/Quimi11/LCD/1.0.0"

  let params = new HttpParams().set('t',this.lcdForm.value.t).set('n',this.lcdForm.value.n)

  this.submitted = true;

  // stop here if form is invalid
  if (this.lcdForm.invalid) {
      return;
  }
  // display form values on success
  this.t = this.lcdForm.value.t
  this.n = this.lcdForm.value.n
  
  this.http.get(root_url+"/lcdOneByOne" ,{params}).subscribe(
    (data: []) => {
      var acum = []
       data['result'].forEach(element => {
            element = element.replace(/(\\r\\n)|([\r\n])/gmi, '<br/>');

            acum.push(element)
      });

      this.numbers=acum
    }
  )
 
}

onReset() {
  this.submitted = false;
  this.lcdForm.reset();
}

}
