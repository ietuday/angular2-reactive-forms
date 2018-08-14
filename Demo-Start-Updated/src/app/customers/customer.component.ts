import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators,ValidatorFn, AbstractControl, FormArray } from '@angular/forms';
import { Customer } from './customer';

import 'rxjs/add/operator/debounceTime';

function emailMatcher(c: AbstractControl){
    let emailControl = c.get('email');
    let confirmControl = c.get('confirmEmail');
    
    if(emailControl.pristine || confirmControl.pristine){
        return null;
    }

    if(emailControl.value === confirmControl.value){
        return null;
    }

    return { 'match': true };
}

function ratingRange(min:number, max:number): ValidatorFn{
    return (c: AbstractControl): {[key: string] : boolean | null} => {
        if(c.value != undefined && (isNaN(c.value) || c.value<min || c.value>max)){
            return{ 'range': true}
        };
        return null;    
    }
}

@Component({
    selector: 'my-signup',
    templateUrl: './app/customers/customer.component.html'
})
export class CustomerComponent  {
    customerForm: FormGroup;
    customer: Customer= new Customer();
    emailMessage: string;
    private validationMessage = {
        required: 'Please enter your email',
        pattern: 'Please enter a valid address'
    };

    get addresses(): FormArray{
        return <FormArray>this.customerForm.get('addresses');
    }
    
    constructor(private _fb: FormBuilder ){

    }

    ngOnInit(){
        this.customerForm = this._fb.group({
            firstName : ['', [Validators.required, Validators.minLength(3)]],
            lastName :['', [Validators.required, Validators.maxLength(50)]],
            emailGroup: this._fb.group({
                email : ['', [Validators.required, Validators.pattern('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+')]],
                confirmEmail:['', Validators.required],
            }, {validator: emailMatcher}),
            phone: [''],
            notification:'email',
            rating:['',ratingRange(1, 5 )],
            sendCatalog : true,
            addresses: this._fb.array([this.buildAddress()])
        });

        this.customerForm.get('notification').valueChanges.subscribe(value =>{
            this.setNotification(value);
        });

        const emailControl = this.customerForm.get('emailGroup.email');
        emailControl.valueChanges.debounceTime(1000).subscribe(value =>{
            this.setMessage(emailControl);
        })
    }

    save() {
        console.log('saved : ' + JSON.stringify(this.customerForm.value));
    }

    addAddress(): void {
        this.addresses.push(this.buildAddress());
    }

    buildAddress(): FormGroup {
        return this._fb.group({
                addressType: 'home',
                street1: '',
                street2: '',
                city: '',
                state: '',
                zip: ''
        });
    }

    populateTestData(): void{
        // this.customerForm.setValue({
        //     firstName: 'Udayaditya',
        //     lastName: 'Singh',
        //     email: 'udayaditya.singh@gmail.com',
        //     sendCatalog:false
        // });

        // this.customerForm.patchValue({
        //     firstName: 'Udayaditya',
        //     lastName: 'Singh',
        //     email: 'udayaditya.singh@gmail.com',
        //     sendCatalog:false
        // });
    }

    setMessage(c:AbstractControl): void {
        this.emailMessage = '';
        if((c.touched || c.dirty) && c.errors){
            this.emailMessage = Object.keys(c.errors).map(key =>
              this.validationMessage[key]).join(' ');
        }
    }

    setNotification(notifyVia: string){
      const phoneControl = this.customerForm.get('phone');
      if(notifyVia === 'text'){
        phoneControl.setValidators(Validators.required);
      }else{
          phoneControl.clearValidators();
      }
      phoneControl.updateValueAndValidity();
    }

 } 
