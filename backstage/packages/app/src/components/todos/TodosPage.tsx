import React from 'react';
import { Page, Header, Content, InfoCard } from '@backstage/core-components';
import { Grid, Typography, Card, CardContent, useTheme } from '@material-ui/core';

export const TodosPage = () => {
  const theme = useTheme();

  return (
  <Page themeId="tool">
    <Header title="TODOs" subtitle="Task Management" />
    <Content>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <InfoCard title="TODO Management">
            <Typography variant="body1" paragraph>
              El plugin TODO escanea tu código en busca de comentarios TODO, FIXME, y HACK
              para crear un listado centralizado de tareas pendientes.
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Para ver TODOs específicos, visita la página de cualquier componente
              en el catálogo y haz clic en el tab "TODOs".
            </Typography>
          </InfoCard>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Tipos de TODOs Detectados</Typography>
              <Typography variant="body2">
                • TODO: Tareas pendientes<br/>
                • FIXME: Código que necesita arreglo<br/>
                • HACK: Soluciones temporales<br/>
                • XXX: Advertencias importantes
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Cómo agregar TODOs</Typography>
              <Typography variant="body2" paragraph>
                Simplemente agrega comentarios en tu código:
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
{`// TODO: Implementar autenticación
// FIXME: Corregir bug de memoria
// HACK: Solución temporal para el deploy
// XXX: Revisar esta implementación urgente`}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Content>
  </Page>
  );
};