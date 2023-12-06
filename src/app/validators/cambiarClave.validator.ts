import { AbstractControl, FormControl, ValidationErrors } from "@angular/forms";

export class CambiarClave {
    static patternValidatorNumber(control: FormControl): ValidationErrors | null {
        var regex = /\d/;
        if (regex.test(control.value)) {
            return null;
        }else{
            return { has_number: true };
        }
    }

    static patternValidatorCapCase(control: FormControl): ValidationErrors | null {
        var regex = /[A-Z]/;
        if (regex.test(control.value)) {
            return null;
        }else{
            return { has_capital_case: true };
        }
    }

    static patternValidatorSmCase(control: FormControl): ValidationErrors | null  {
        var regex = /[a-z]/;
        if (regex.test(control.value)) {
            return null;
        }else{
            return { has_small_case: true };
        }
    }

    static patternValidatorSpcCharacter(control: FormControl): ValidationErrors | null  {
        var regex = /\W|_/;
        if (regex.test(control.value)) {
            return null;
        }else{
            return { has_special_character: true };
        }
    }

    static passwordMatchValidator(control: AbstractControl) {
        const password: string = control.get('password')?.value; // get password from our password form control
        const confirmPassword: string = control.get('confirmPassword')?.value; // get password from our confirmPassword form control
        // compare is the password math
        if (password !== confirmPassword) {
            // if they don't match, set an error in our confirmPassword form control
            control.get('confirmPassword')?.setErrors({ NoPassswordMatch: true });
        }
    }
}