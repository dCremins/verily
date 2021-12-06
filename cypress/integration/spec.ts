describe('Launches', () => {
  it('redirects to the correct page', () => {
    cy.visit('/');
    cy.contains('SpaceX');
    cy.url().should('include', '/launch');
  });

  it('displays the table and launch data', () => {
    cy.get('[data-cy="row-1"] > .cdk-column-flight_number').should(
      'contain.text',
      '1',
    );
    cy.get('[data-cy="row-1"] > .cdk-column-date_local').should(
      'contain.text',
      '2006',
    );
    cy.get('[data-cy="row-1"] > .cdk-column-name').should(
      'contain.text',
      'Falcon',
    );
    cy.get('[data-cy="row-1"] > .cdk-column-details').should(
      'contain.text',
      'Engine failure at 33 seconds',
    );
  });

  it('displays a tooltip indicating the press kit availability', () => {
    cy.get('[data-cy="row-1"]').trigger('mouseenter');
    cy.get('.row-tooltip').should('exist');
  });

  it('allows the table to be sorted', () => {
    cy.get('.mat-header-row > .cdk-column-flight_number').click();
    cy.get('[data-cy="row-152"] > .cdk-column-flight_number').should(
      'contain.text',
      '152',
    );
    cy.get('[data-cy="row-1"] > .cdk-column-flight_number').should('not.exist');
  });

  it('allows the table to be paged through', () => {
    cy.get('.mat-paginator-range-label')
      .scrollIntoView()
      .should('include.text', '1 – 10 of 147');
    cy.get('.mat-paginator-navigation-last').should('be.visible');
    cy.get('.mat-paginator-navigation-last').click();
    cy.get('.mat-paginator-range-label')
      .scrollIntoView()
      .should('include.text', '141 – 147 of 147');
  });

  it('opens a press kit if available', () => {
    cy.visit('/', {
      onBeforeLoad(win) {
        cy.stub(win, 'open');
      },
    });
    cy.window().its('open').should('not.be.called');
    cy.get('[data-cy="row-5"]').click();
    cy.window().its('open').should('be.called');
  });
});
