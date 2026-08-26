import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutorizzazioneLotti } from './autorizzazione-lotti';

describe('AutorizzazioneLotti', () => {
  let component: AutorizzazioneLotti;
  let fixture: ComponentFixture<AutorizzazioneLotti>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutorizzazioneLotti],
    }).compileComponents();

    fixture = TestBed.createComponent(AutorizzazioneLotti);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
