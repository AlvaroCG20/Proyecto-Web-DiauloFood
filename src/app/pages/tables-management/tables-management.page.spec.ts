import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TablesManagementPage } from './tables-management.page';

describe('TablesManagementPage', () => {
  let component: TablesManagementPage;
  let fixture: ComponentFixture<TablesManagementPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TablesManagementPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
