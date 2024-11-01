import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css']
})
export class ReportComponent implements OnInit {
  reportForm!: FormGroup;
  successMessage: string = '';

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.reportForm = this.fb.group({
      subject: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
      message: ['', Validators.required],
      attachment: [null]
    });
  }

  onSubmit(): void {
    if (this.reportForm.valid) {
      const formData = new FormData();
      
      // Use optional chaining or non-null assertion to handle possibly null values
      formData.append('subject', this.reportForm.get('subject')!.value);
      formData.append('email', this.reportForm.get('email')!.value);
      formData.append('phoneNumber', this.reportForm.get('phoneNumber')!.value);
      formData.append('message', this.reportForm.get('message')!.value);

      const attachmentControl = this.reportForm.get('attachment');
      if (attachmentControl?.value) {  // Check if attachment has a value
        formData.append('attachment', attachmentControl.value);
      }
      console.log('Report submitted:', this.reportForm.value);

      // Display success message
      this.successMessage = 'Form successfully submitted!';

      setTimeout(() => {
        this.reportForm.reset();
        this.successMessage = ''; // Clear the message
      }, 3000);
    } else {
      this.reportForm.markAllAsTouched();
    }
  }
}
