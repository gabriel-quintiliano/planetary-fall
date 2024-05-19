import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, EmbeddedViewRef, Host, HostBinding, HostListener, Input, OnInit, Renderer2, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';

@Component({
  selector: 'app-news-ticker',
  templateUrl: './news-ticker.component.html',
  styleUrls: ['./news-ticker.component.scss']
})
export class NewsTickerComponent implements AfterViewInit {
  /* this.gap and this.animationDuration have its values bound to their corresponding
   * css custom properties via @HostBinding and their value can also be set from
   * "outside" the component via @Input. These two also have default values (important) */
  @Input() @HostBinding('style.--_gap') gap: string = '2rem';
  @Input() @HostBinding('style.--_animation-duration') animationDuration: string = '2000ms';
  @Input({ required: true }) newsText!: string;
  
  // so there is a HTMLParagraphElement so that later we can get its clientWidth
  protected count: number = 1;
  @ViewChild('paragraph') private parElem!: ElementRef<HTMLParagraphElement>;

  // used in the callback bellow to prevent it from running to many times unnecessarily
  private activeSetTimeout?: ReturnType<typeof setTimeout>;
  
  // adds this callback to window resize event
  @HostListener('window:resize') handleResize() {
    // there is any timeout, we'll clear it
    clearTimeout(this.activeSetTimeout);
    
    // if the resizing stops, this timeout finally will not be cleared and
    // count will be recalculated after 200ms
    this.activeSetTimeout = setTimeout(() => {
      this.count = this.calcNewsTextCount();
    }, 200);
  }

  constructor(
    private curComponent: ElementRef<HTMLElement>, // NewsTickerComponent itself
    private cdr: ChangeDetectorRef, // it'll be used within `ngAfterViewInit`
  ) { }

  ngAfterViewInit(): void {
    // right now, the HTMLParagraphElement is already present on DOM (thus, has height and width)
    this.count = this.calcNewsTextCount();
    // as this.count had a value in the beginning of initialization and has now changed this
    // value before the end of initialization, it's important that we tell that to Angular.
    this.cdr.detectChanges();
  }

  calcNewsTextCount(): number {
    const parElemClientWidth = this.parElem.nativeElement.clientWidth;
    const curCompClientWidth = this.curComponent.nativeElement.clientWidth;

    let gap: number = parseInt(window.getComputedStyle(this.curComponent.nativeElement).getPropertyValue('gap'));
    gap = isNaN(gap) ? 0 : gap; // will be `NaN` when `gap` is not set or set with an invalid value

    // calc wrapper size - gap because we intentionally want to disregard
    // that if it appears on the end of the wrapper; divide that value for
    // the total width of the added elem (elem + gap); and finally, add 1
    // to account for the translate(-100%, 0) so no void or flicker is shown
    return Math.ceil((curCompClientWidth - gap) / (parElemClientWidth + gap)) + 1;
  }
}