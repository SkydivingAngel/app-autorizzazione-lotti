import { Component, ElementRef, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { AuthenticationService } from '../services/auth-service';
import { Router } from '@angular/router';
import { Lotto } from './lotto';
import { Articolo } from './articolo';
import { DxDataGridModule , DxLoadIndicatorModule, DxSelectBoxComponent, DxSelectBoxModule } from 'devextreme-angular';
import { ValueChangedEvent } from 'devextreme/ui/select_box';
import { LottiService } from '../services/lotti-service';
import { Subject, takeUntil } from 'rxjs';
import { Title } from '@angular/platform-browser';
import { confirm, custom, } from 'devextreme/ui/dialog';
import { DxButtonModule, DxToastModule } from 'devextreme-angular';
import notify from 'devextreme/ui/notify';
import { DxDataGridTypes } from 'devextreme-angular/ui/data-grid';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-autorizzazione-lotti',
  imports: [DxDataGridModule , DxSelectBoxModule, DxLoadIndicatorModule, DxButtonModule, DxToastModule ],
  templateUrl: './autorizzazione-lotti.html',
  styleUrl: './autorizzazione-lotti.css',
})
export class AutorizzazioneLotti implements OnInit, OnDestroy {

  @ViewChild('selectBoxRef', { static: false }) selectBox!: DxSelectBoxComponent;
  
  lottoSelezionato= signal<string>("");
  lottoSelezionatoDescrizione = signal<string>("");

  lottoArray= signal<Lotto[]>([]);

  articoloArray = signal<Articolo[]>([]);

  private destroy$ = new Subject<void>();

  autorizzazione_lotti_message= signal<string>('');
  autorizzazione_lotti_quantita_articoli = signal<string>('');
  isSelectBoxDisabled = signal<boolean>(false);
  isLoadIndicatorVisibleLotti: boolean = false;
  isLoadIndicatorVisibleDettaglio: boolean = false;

  constructor(private authService : AuthenticationService, private lottiService : LottiService, private router: Router,
    private title: Title) {

    if(!this.authService.isLoggedIn()) {
      this.authService.logout();
      this.router.navigate(['/login']);
      return;
    }
  }

  ngOnInit(): void {

    this.title.setTitle('Autorizzazione Lotti - Elenco');
    this.loadData();

    // alert(environment.baseUrl);
  }

  onSelectionChanged(e: DxDataGridTypes.SelectionChangedEvent) {

    const currentSelectedKeys = e.currentSelectedRowKeys; 
    const allSelectedData = e.selectedRowsData;
    //alert(currentSelectedKeys[0] + "\n" + JSON.stringify(allSelectedData));

  }

  onDoubleClick(e: DxDataGridTypes.RowDblClickEvent) {

    if (e.rowType !== 'data') {
      return;
    }

    // Dati della riga cliccata
    const rowData = e.data;
    //alert(`Dati riga selezionata: ${e.rowIndex}\n`  + JSON.stringify(rowData));

    //this.toastMessage.set("Ciao Ciao");
    //this.isToastVisible = true;

        notify(
            {
                message: `Dati riga selezionata: ${e.rowIndex} ->`  + JSON.stringify(rowData),
                type: "success", 
                //width: 300,
                //height: 50,
                position: {
                    at: "bottom",
                    my: "bottom",
                    of: "#container"
                },
                show: {
                  type: 'fade',
                  duration: 400,
                  from: 0,
                  to: 1
                },
                hide: {
                    type: 'fade',
                    duration: 400,
                    from: 1,
                    to: 0
                },
                displayTime: 4000
            }
        );

  }

  private loadData(){

      this.isLoadIndicatorVisibleLotti = true;
      this.autorizzazione_lotti_message.set("Caricamento Lotti in corso...");

      this.lottiService.elencoLotti(0, 0)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
          next: (result) => {
            //alert(JSON.stringify(result));
            if(result) {
            }

            this.lottoArray.set(result);
            this.autorizzazione_lotti_message.set("Totale Lotti Trovati: " + this.lottoArray().length);
            this.isLoadIndicatorVisibleLotti = false;

            this.selectBox.instance.clear();
          },
          error: (error) => {
            //alert(error.status + " - " + error.error.message);  
            //if (error.status == 0 || error.status == 401) {
                //this.authService.logout();
                //this.router.navigate(['/login']);
            //}
            //alert("AutorizzazioneLotti\n" + JSON.stringify(error) +  " - " + error.status + " - " + error.error); 
            //this.login_message.set(error.error.message);
            this.isLoadIndicatorVisibleLotti = false;
          },
          complete: () => {
            this.isLoadIndicatorVisibleLotti = false;
          }
      });

  }

  onValueChanged(e: ValueChangedEvent) {

      const previousValue = e.previousValue;
      const newValue = e.value;
      this.lottoSelezionato.set(newValue);
      
      if(this.lottoSelezionato().trim() !== ""){
        
        this.lottoSelezionatoDescrizione.set("[" + this.lottoSelezionato() + "]");
        this.isLoadIndicatorVisibleDettaglio = true;
        this.autorizzazione_lotti_quantita_articoli.set("Caricamento Articoli Lotto in corso...");

        this.isSelectBoxDisabled = signal<boolean>(true);

        this.lottiService.dettaglioLotto(this.lottoSelezionato(), 0, 0)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
            next: (result) => {
              //alert(JSON.stringify(result));
              if(result) {
              }

              this.articoloArray.set(result);
              this.isLoadIndicatorVisibleDettaglio = false;
              this.isLoadIndicatorVisibleDettaglio = false;
              this.isSelectBoxDisabled = signal<boolean>(false);

              if(this.articoloArray().length > 0){
                this.autorizzazione_lotti_quantita_articoli.set("Quantità Totale Articoli nel Lotto: " + this.articoloArray().reduce((sum, articolo) => sum + articolo.quantita, 0) );
              }
              else{
                this.autorizzazione_lotti_quantita_articoli.set("Quantità Totale Articoli nel Lotto: 0");
              }

            },
            error: (error) => {
              this.isSelectBoxDisabled = signal<boolean>(false);
              //console.log('Error Occurred', JSON.stringify(error));
              //alert(error.status + " - " + error.error.message);  
              if (error.status == 400) {
                //this.login_message.set(error.error.message);
              }
              //alert("AutorizzazioneLotti: " + JSON.stringify(error) + " - " + error.status + " - " + error.error); 
              //this.login_message.set(error.error.message);
              this.isLoadIndicatorVisibleDettaglio = false;
              this.isLoadIndicatorVisibleDettaglio = false;
              this.lottoSelezionatoDescrizione.set("");

              this.authService.logout();
              this.router.navigate(['/login']);
              return;
            },
            complete: () => {
              //console.log('Stream Completed')
              //alert(JSON.stringify('Stream Completed'));
              this.isLoadIndicatorVisibleDettaglio = false;
            }
        });

      }

  }

  public autorizza(){

    if(this.lottoSelezionato().trim() !== ""){
      let result = confirm(`<span style="color: black; font-size: 15px; font-weight: normal;"> Autorizzare il Lotto: </span><b><span style="color: red; font-size: 15px; font-weight: bold;">${this.lottoSelezionato()}</span></b>?`, "Conferma la scelta");
        result.then((dialogResult) => {
            if(dialogResult){
              this.autorizzaLotto();
            }
        });
    }
  }

  private autorizzaLotto(){

    this.lottiService.autorizzaLotto(this.lottoSelezionato(), 0, 0)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
        next: (result) => {

          if(result){

          let myDialog = custom({
            title: "Autorizzazione Lotto",
            messageHtml: `<span style="color: black; font-size: 15px; font-weight: normal;">Lotto: </span><b><span class="open-sans-login-400b" style="color: red; font-size: 15px; font-weight: bold;">${this.lottoSelezionato()}</span>&nbsp;<span style="color: black; font-size: 15px; font-weight: normal;">Autorizzato!</span>`,
            buttons: [{
              text: "Ok",
              onClick: (e) => {
                return { buttonText: e.component.option("text") }
              }
            }, 
            // ...
            ]
          });

          myDialog.show().then((dialogResult: { buttonText: any; }) => {
            console.log(dialogResult.buttonText);
            
            this.clearFields();
            this.loadData();
          });



          }
          //alert(JSON.stringify(result));
          // if(result) {
          // }

          // this.articoloArray.set(result);
          // this.isLoadIndicatorVisibleDettaglio = false;

          // if(this.articoloArray().length > 0){
          //   this.autorizzazione_lotti_quantita_articoli.set("Quantità Totale Articoli nel Lotto: " + this.articoloArray().reduce((sum, articolo) => sum + articolo.quantita, 0) );
          // }
          // else{
          //   this.autorizzazione_lotti_quantita_articoli.set("Quantità Totale Articoli nel Lotto: 0");
          // }

        },
        error: (error) => {
          //console.log('Error Occurred', JSON.stringify(error));
          //alert(error.status + " - " + error.error.message);  
          if (error.status == 400) {
            //this.login_message.set(error.error.message);
          }
          alert("AutorizzazioneLotti: " + JSON.stringify(error) + " - " + error.status + " - " + error.error); 
          //this.login_message.set(error.error.message);
          // this.isLoadIndicatorVisibleDettaglio = false;
          // this.lottoSelezionatoDescrizione.set("");

          // this.authService.logout();
          // this.router.navigate(['/login']);
        },
        complete: () => {
          //console.log('Stream Completed')
          //alert(JSON.stringify('Stream Completed'));
          this.isLoadIndicatorVisibleDettaglio = false;
        }
    });










    //window.location.reload();


  }

  private clearFields(){
    this.lottoArray.set([]);
    this.articoloArray.set([]);
    this.autorizzazione_lotti_quantita_articoli.set("");
    this.lottoSelezionatoDescrizione.set("");
    this.lottoSelezionato.set("")
    this.autorizzazione_lotti_message.set("");
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    //this.authService.logout();
  }

}