/**
 * This typescript file is reponsible for all the features on the leads component. It is dependent on:
 *  - The lead model/interface
 *  - The lead service
 */

import { AfterViewInit, Component, ViewChild } from '@angular/core';

/**
 * Import Material components
 */
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { SelectionModel } from '@angular/cdk/collections';
import { FormGroup } from '@angular/forms';

/**
 * Imports from the RxJS library
 */

import { Lead, LeadStatus } from '../../../models/server_responses/lead.model';
import { LeadService } from '../../../services/lead.service';
import { LeadDetailsComponent } from './lead-details/lead-details.component';
import { Title } from '@angular/platform-browser';
import * as _ from 'lodash';
import { FormService } from 'src/app/services/form.service';
import { CampaignService } from 'src/app/services/campaign.service';

@Component({
  selector: 'app-leads',
  templateUrl: './leads.component.html',
  styleUrls: ['./leads.component.css']
})

export class LeadsComponent implements AfterViewInit {
  leads: Lead[];
  leadStatus = LeadStatus;
  leadStatusKeys: Array<string>;
  filterPlaceholder = $localize`Search for specific names, area codes, IDs, ...`;
  /**
   * Stores the values to filter by.
   */
  filterValue = {
    form: 'any',
    campaign: 'any',
    other: ''
  };
  isLoading = true;
  readonly dataSource: MatTableDataSource<Lead>;
  selection = new SelectionModel<Lead>(true, []);
  group: FormGroup;
  /**
   * Maps formId to formName
   */
  formNameMap: Map<number, string>;
  /**
   * Maps campaignId to campaignName
   */
  campaignNameMap: Map<number, string>;
  /**
   * Column IDs that we plan to show on the table are stored here
   */
  readonly displayedColumns: string[] = [
    'select',
    'leadId',
    'date',
    'name',
    'phone_number',
    'email',
    'status',
    'formName',
    'campaignName',
    'details'
  ];

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  constructor(private readonly leadService: LeadService,
              private readonly formService: FormService,
              private readonly campaignService: CampaignService,
              public dialog: MatDialog,
              private titleService: Title) {
    this.titleService.setTitle($localize`Leads`);
    this.dataSource = new MatTableDataSource();
    this.loadAllLeads();
    this.leadStatusKeys = Object.keys(this.leadStatus);
    this.formService.getFormNameMap().subscribe(map => this.formNameMap = map);
    this.campaignService.getCampaignNameMap().subscribe(map => this.campaignNameMap = map);
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;

    /**
     * This will let the dataSource sort feature to access nested properties
     * in the JSON such as column_data.
     */
    this.dataSource.sortingDataAccessor = (lead, property) => {
      switch (property) {
        case 'name': return lead.columnData.FULL_NAME;
        case 'phone_number': return lead.columnData.PHONE_NUMBER;
        case 'email': return lead.columnData.EMAIL;
        case 'date': return new Date(lead.date).getTime();
        case 'formName': return this.formNameMap.get(lead.formId);
        case 'campaignName': return this.campaignNameMap.get(lead.campaignId);
        default: return lead[property];
      }
    };
    this.dataSource.sort = this.sort;

    /**
     * @param filterPredicateData The whole data we have in the JSON.
     * @param filterPredicateFilter The filterValue object containing all the filter fields the user has specified
     */
    this.dataSource.filterPredicate = (filterPredicateData: any, filterPredicateFilter: string): boolean  => {
      const cleanString = (str: string): string => str.trim().toLowerCase();
      const hasFilter = (data: any, filter: string): boolean => {
        // traverse through JSON's tree like structure
        if (typeof data === 'object') {
          for (const key of Object.keys(data)) {
            if (hasFilter(data[key], filter)) {
              return true;
            }
          }
        } else {
          // if you hit a key-value pair where the value is
          // a primitve type compare and return only if filter found
          const value = cleanString(_.toString(data));
          if (value.indexOf(filter) !== -1) {
            return true;
          }
        }
        return false;
      };
      const filters = JSON.parse(filterPredicateFilter);
      const formMatch = filters.form === 'any' || filterPredicateData.formId === filters.form;
      const campaignMatch = filters.campaign === 'any' || filterPredicateData.campaignId === filters.campaign;
      return formMatch
        && campaignMatch
        && hasFilter(filterPredicateData, cleanString(filters.other));
    };
  }

  /**
   * This will access the leads from the leadService and handle the filterPredicate and the isLoading boolean value.
   */
  loadAllLeads(): void {
    this.isLoading = true;
    this.leadService.getAllLeads().subscribe((leads) => {
      this.dataSource.data = leads;
      this.isLoading = false;
    });
  }

  /**
   * Called when the lead status is changed by the user or new notes are written
   * @param lead the lead to be updated
   */
  updateLead(lead: Lead) {
    this.leadService.updateLead(lead).subscribe();
  }

 /**
  * This method will listen to the filter field in the html and update the value of dataSource
  * @param column the column to filter by
  */
  applyFilter() {
    this.dataSource.filter = JSON.stringify(this.filterValue);
    if (this.dataSource.paginator != null) {
      this.dataSource.paginator.firstPage();
    }
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
        this.selection.clear() :
        this.dataSource.data.forEach(row => this.selection.select(row));
  }

    /** The label for the checkbox on the passed row */
  checkboxLabel(row?: Lead): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.leadId + 1}`;
  }

  /*
   * This method listens to the message leads button
   */
  emailLead(){
    // filter leads with no email and get only their emails
    const emailRecipients =
      this.selection.selected
      .filter(lead => lead.columnData.EMAIL !== undefined)
      .map(leadWithEmail => leadWithEmail.columnData.EMAIL);
    // incase all the selected leads do not have email address
    if (emailRecipients.length === 0) {
      alert('Please select at least one lead with an email address.');
      return;
    }
    // make the recepients ready for url use
    const emailRecipientsString = emailRecipients.join(',');
    const emailUrl: string =
      'https://mail.google.com/mail/u/0/?view=cm&fs=1&to='
      + emailRecipientsString
      + '&su=Greetings';
    window.open(emailUrl, '_blank');
  }

  /*
   * This method listens to the message leads button
   */
  smsLead(){
    // filter leads with no email and get only their phone numbers
    const smsRecipients =
      this.selection.selected
      .filter(lead => lead.columnData.PHONE_NUMBER !== undefined)
      .map(leadWithPhone => leadWithPhone.columnData.PHONE_NUMBER);
    // incase all the selected leads do not have email address
    if (smsRecipients.length === 0) {
      alert('Please select at least one lead with a Phone Number.');
      return;
    }
    // make the recepients ready for url use
    const smsRecipientsString = smsRecipients.join(';');
    const smsUrl: string = 'sms://' + smsRecipientsString;
    window.open(smsUrl, '_blank');
  }

  checkSelection(){
    return this.selection.selected.length > 0;
  }

  openDialog(leadToShow: Lead) {
    const dialogRef = this.dialog.open(LeadDetailsComponent, {
      width: '750px',
      data: {lead: leadToShow}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result != null) {
        leadToShow.notes = result;
        // put the new lead
        this.updateLead(leadToShow);
      }
    });
  }
}
