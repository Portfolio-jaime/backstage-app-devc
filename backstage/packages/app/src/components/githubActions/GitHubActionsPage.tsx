import React from 'react';
import { Page, Header, Content, InfoCard } from '@backstage/core-components';
import { Grid, Typography, Card, CardContent, useTheme } from '@material-ui/core';

export const GitHubActionsPage = () => {
  const theme = useTheme();

  return (
    <Page themeId="tool">
      <Header title="GitHub Actions" subtitle="CI/CD Workflows Overview" />
      <Content>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <InfoCard title="GitHub Actions Integration">
            <Typography variant="body1" paragraph>
              Este plugin muestra workflows de GitHub Actions de tus repositorios.
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Para ver workflows específicos, visita la página de cualquier componente
              en el catálogo que tenga la anotación "github.com/project-slug".
            </Typography>
          </InfoCard>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Repositorios Configurados</Typography>
              <Typography variant="body2">
                • <strong>Portfolio-jaime/backstage-app-devc</strong> - Aplicación principal de Backstage<br/>
                • <strong>Portfolio-jaime/backstage-dashboard-templates</strong> - Templates de dashboards<br/>
                • <strong>Portfolio-jaime/backstage-software-templates</strong> - Templates de software<br/><br/>
                <em>Para ver workflows específicos, visita cualquier componente en el catálogo que tenga la anotación:</em><br/>
                <code>github.com/project-slug: Portfolio-jaime/repo-name</code>
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Cómo usar</Typography>
              <Typography variant="body2">
                1. Ve al <strong>catálogo de componentes</strong><br/>
                2. Selecciona un componente con anotación de GitHub<br/>
                3. Haz clic en el tab <strong>"GitHub Actions"</strong> o <strong>"CI/CD"</strong><br/><br/>
                <em>También puedes ver el estado de workflows directamente desde la vista general del componente.</em>
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6">Configuración de Componentes</Typography>
              <Typography variant="body2" paragraph>
                Para que un componente muestre workflows de GitHub Actions, debe tener estas anotaciones en su <code>catalog-info.yaml</code>:
              </Typography>
              <Typography
                variant="body2"
                component="pre"
                style={{
                  background: theme.palette.type === 'dark' ? theme.palette.grey[800] : theme.palette.grey[100],
                  color: theme.palette.text.primary,
                  padding: '12px',
                  borderRadius: '4px',
                  fontSize: '0.8rem',
                  border: `1px solid ${theme.palette.divider}`,
                  overflow: 'auto'
                }}
              >
{`metadata:
  annotations:
    github.com/project-slug: Portfolio-jaime/nombre-repo
    # Opcional: especificar workflows específicos
    github.com/workflows: build,test,deploy`}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Content>
  </Page>
  );
};